<?php
require_once 'db.php';

header("Content-Type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Helper para responder
function jsonResponse($success, $message, $data = []) {
    echo json_encode(['success' => $success, 'message' => $message, ...$data]);
    exit;
}

// 1. Validar Auth
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = '';

if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $token = $matches[1];
} elseif (isset($_GET['token'])) {
    $token = $_GET['token'];
}

if (!$token) {
    jsonResponse(false, 'No token provided');
}

// Decodificar token simulado (En producción usar JWT real)
$parts = explode('.', $token);
if (count($parts) < 2) jsonResponse(false, 'Invalid token');
$payload = json_decode(base64_decode($parts[0]), true);
$username = $conn->real_escape_string($payload['username'] ?? '');

// Obtener usuario actual
$sqlUser = "SELECT * FROM users WHERE username = '$username'";
$resUser = $conn->query($sqlUser);
if (!$resUser || $resUser->num_rows === 0) {
    jsonResponse(false, 'Usuario no encontrado');
}
$currentUser = $resUser->fetch_assoc();
$isAdmin = (int)$currentUser['isAdmin'] === 1;
$userId = (int)$currentUser['id'];

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: Listar Servicios ---
if ($method === 'GET') {
    $services = [];
    
    if ($isAdmin) {
        // Admin ve todo o filtra por usuario
        $filterUser = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
        $sql = "SELECT s.*, u.username, u.email, u.phone 
                FROM services s 
                JOIN users u ON s.user_id = u.id ";
        
        if ($filterUser) {
            $sql .= "WHERE s.user_id = $filterUser ";
        }
        $sql .= "ORDER BY s.entry_date DESC";
    } else {
        // Cliente ve solo lo suyo
        $sql = "SELECT * FROM services WHERE user_id = $userId ORDER BY entry_date DESC";
    }

    $result = $conn->query($sql);
    
    while ($row = $result->fetch_assoc()) {
        // Fetch images for each service
        $svcId = $row['id'];
        $imgSql = "SELECT image_data FROM service_images WHERE service_id = $svcId";
        $imgRes = $conn->query($imgSql);
        $images = [];
        while($imgRow = $imgRes->fetch_assoc()) {
            $images[] = $imgRow['image_data'];
        }
        $row['images'] = $images;
        $services[] = $row;
    }

    jsonResponse(true, 'Servicios obtenidos', ['services' => $services]);
}

// --- POST: Crear Servicio (Solo Admin) ---
if ($method === 'POST') {
    if (!$isAdmin) jsonResponse(false, 'Acceso denegado');

    $input = json_decode(file_get_contents('php://input'), true);
    
    $targetUserId = (int)($input['user_id'] ?? 0);
    $bikeModel = $conn->real_escape_string($input['bike']);
    $serviceType = $conn->real_escape_string($input['type']);
    $description = $conn->real_escape_string($input['description']);
    $status = $conn->real_escape_string($input['status'] ?? 'recibido');
    $cost = (float)($input['cost'] ?? 0);
    $images = $input['images'] ?? []; // Array of base64 strings

    if (!$targetUserId || !$bikeModel || !$serviceType) {
        jsonResponse(false, 'Datos incompletos (user_id, bike, type requeridos)');
    }

    $sqlInsert = "INSERT INTO services (user_id, bike_model, service_type, description, status, cost) 
                  VALUES ($targetUserId, '$bikeModel', '$serviceType', '$description', '$status', $cost)";
    
    if ($conn->query($sqlInsert)) {
        $serviceId = $conn->insert_id;

        // Guardar imágenes
        if (!empty($images)) {
            $stmt = $conn->prepare("INSERT INTO service_images (service_id, image_data) VALUES (?, ?)");
            foreach ($images as $imgBase64) {
                // Validación básica de base64 podría ir aquí
                $stmt->bind_param("is", $serviceId, $imgBase64);
                $stmt->execute();
            }
            $stmt->close();
        }

        jsonResponse(true, 'Servicio registrado exitosamente', ['id' => $serviceId]);
    } else {
        jsonResponse(false, 'Error DB: ' . $conn->error);
    }
}

// --- PUT: Actualizar Estado (Solo Admin) ---
if ($method === 'PUT') {
    if (!$isAdmin) jsonResponse(false, 'Acceso denegado');

    $input = json_decode(file_get_contents('php://input'), true);
    $svcId = (int)($input['id'] ?? 0);
    $status = $conn->real_escape_string($input['status'] ?? '');

    if (!$svcId || !$status) jsonResponse(false, 'ID y Status requeridos');

    $sqlEl = "UPDATE services SET status = '$status' WHERE id = $svcId";
    if ($conn->query($sqlEl)) {
        jsonResponse(true, 'Estado actualizado');
    } else {
        jsonResponse(false, 'Error actualizando: ' . $conn->error);
    }
}

$conn->close();
?>
