<?php
// api/wompi_webhook.php
// Receptor seguro de notificaciones de Wompi (pagos)
// NO mover ni renombrar — Wompi enviará webhooks a esta URL

require 'auth_helper.php'; // Solo para acceso a funciones helper, no para auth de usuario
header('Content-Type: application/json');

// Wompi llama a este endpoint via POST con Content-Type: application/json
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// --- PASO 1: LEER CUERPO RAW ANTES DE CUALQUIER COSA ---
// Es crítico leer el body antes de parsearlo para calcular la firma correctamente
$rawBody = file_get_contents('php://input');

// --- PASO 2: VERIFICAR FIRMA HMAC ---
// Sin esto, cualquiera puede falsificar un pago
$wompiSecret = getenv('WOMPI_WEBHOOK_SECRET');
if (!$wompiSecret) {
    error_log('[Wompi] ERROR: WOMPI_WEBHOOK_SECRET no configurado');
    http_response_code(500);
    echo json_encode(['error' => 'Webhook no configurado']);
    exit;
}

$signature = $_SERVER['HTTP_X_WOMPI_SIGNATURE_V1'] ?? '';
$timestamp  = $_SERVER['HTTP_X_WOMPI_TIMESTAMP'] ?? '';

if (!$signature || !$timestamp) {
    error_log('[Wompi] Webhook sin headers de firma');
    http_response_code(401);
    echo json_encode(['error' => 'Firma requerida']);
    exit;
}

// La firma de Wompi: HMAC-SHA256 de "timestamp.body"
$expected = hash_hmac('sha256', $timestamp . '.' . $rawBody, $wompiSecret);

// Comparación de tiempo constante — previene timing attacks
if (!hash_equals(strtolower($expected), strtolower($signature))) {
    error_log('[Wompi] Firma INVÁLIDA — posible ataque de falsificación');
    http_response_code(401);
    echo json_encode(['error' => 'Firma inválida']);
    exit;
}

// --- PASO 3: PARSEAR EL EVENTO ---
$event = json_decode($rawBody, true);
if (!$event || !isset($event['event'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Payload inválido']);
    exit;
}

// --- PASO 4: PROCESAR SEGÚN EL TIPO DE EVENTO ---
if ($event['event'] === 'transaction.updated') {
    $tx     = $event['data']['transaction'] ?? null;
    $status = $tx['status'] ?? '';
    $ref    = $tx['reference'] ?? '';

    if (!$tx || !$ref) {
        http_response_code(400);
        exit;
    }

    require 'db.php';

    // Buscar la orden por referencia
    $stmt = $conn->prepare("SELECT id, status FROM orders WHERE reference = ?");
    $stmt->bind_param("s", $ref);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row) {
        // No encontrada — puede que sea una referencia de un sistema diferente, no es error
        error_log("[Wompi] Referencia no encontrada: $ref");
        http_response_code(200); // Responder 200 para que Wompi no reintente infinitamente
        echo json_encode(['received' => true, 'note' => 'referencia no encontrada']);
        exit;
    }

    // --- IDEMPOTENCIA: No procesar si ya fue pagada ---
    if ($row['status'] === 'paid') {
        error_log("[Wompi] Referencia $ref ya procesada — ignorando duplicado");
        http_response_code(200);
        echo json_encode(['received' => true, 'note' => 'ya procesado']);
        exit;
    }

    // Actualizar estado según el resultado de Wompi
    $newStatus = match ($status) {
        'APPROVED'  => 'paid',
        'DECLINED'  => 'payment_declined',
        'VOIDED'    => 'cancelled',
        'ERROR'     => 'payment_error',
        default     => null,
    };

    if ($newStatus) {
        $orderId = (int)$row['id'];
        $upd = $conn->prepare("UPDATE orders SET status = ?, wompi_transaction_id = ?, paid_at = NOW() WHERE id = ?");
        $txId = $tx['id'] ?? '';
        $upd->bind_param("ssi", $newStatus, $txId, $orderId);
        $upd->execute();
        error_log("[Wompi] Orden #$orderId actualizada a '$newStatus' (tx: $txId)");
    }
}

// Siempre responder 200 — si Wompi no recibe 200, reintentará
http_response_code(200);
echo json_encode(['received' => true]);
?>
