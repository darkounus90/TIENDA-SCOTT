<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';

// Verificar Auth (Simulado por ahora para no complicar con JWT decode en backend puro sin librería)
// En producción real, aquí se decodificaría el JWT.
// Por simplicidad, aceptaremos el user_id o username como query param "securely" o asumimos el token validado en frontend.
// MEJOR OPCIÓN: Leer el header Authorization y decodificar "manualmente" la parte payload del JWT simulado.

$headers = apache_request_headers();
$authHeader = $headers['Authorization'] ?? '';

if (!$authHeader) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$parts = explode('.', $token);
if (count($parts) < 2) {
     echo json_encode(['success' => false, 'message' => 'Token inválido']);
     exit;
}

$payload = json_decode(base64_decode($parts[0]), true);
$username = $payload['username'] ?? '';

if (!$username) {
    echo json_encode(['success' => false, 'message' => 'Token malformado']);
    exit;
}

// Obtener ID del usuario
$userSql = "SELECT id FROM users WHERE username = '$username'";
$userRes = $conn->query($userSql);
if ($userRes->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
    exit;
}
$userRow = $userRes->fetch_assoc();
$userId = $userRow['id'];

// Obtener Pedidos
$sql = "SELECT id, total, status, created_at FROM orders WHERE user_id = $userId ORDER BY created_at DESC";
$result = $conn->query($sql);

$orders = [];
while ($row = $result->fetch_assoc()) {
    $orderId = $row['id'];
    // Items
    $itemsSql = "SELECT product_name, quantity, price FROM order_items WHERE order_id = $orderId";
    $itemsRes = $conn->query($itemsSql);
    $items = [];
    while ($item = $itemsRes->fetch_assoc()) {
        $items[] = $item;
    }
    $row['items'] = $items;
    $orders[] = $row;
}

echo json_encode(['success' => true, 'orders' => $orders]);
?>
