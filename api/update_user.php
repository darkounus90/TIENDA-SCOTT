<?php
// update_user.php - Actualizar email del usuario logueado
header('Content-Type: application/json');
require 'db.php';

// Autenticación simple por token (simulado)
$auth = null;
if (function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
    if (isset($headers['Authorization'])) $auth = $headers['Authorization'];
}
if (!$auth && isset($_SERVER['HTTP_AUTHORIZATION'])) $auth = $_SERVER['HTTP_AUTHORIZATION'];

if (!$auth || !preg_match('/Bearer (.+)/', $auth, $matches)) {
    echo json_encode(["success" => false, "message" => "No autorizado"]);
    exit;
}
$token = $matches[1];
$payload = json_decode(base64_decode(explode('.', $token)[0]), true);
$username = $payload['username'] ?? '';

if (!$username) {
    echo json_encode(["success" => false, "message" => "Token inválido"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$email = $conn->real_escape_string($data['email'] ?? '');
$phone = $conn->real_escape_string($data['phone'] ?? '');

$updates = [];
if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $updates[] = "email='$email'";
}
if ($phone) {
    $updates[] = "phone='$phone'";
}
$department = $conn->real_escape_string($data['department'] ?? '');
if ($department) $updates[] = "department='$department'";

$city = $conn->real_escape_string($data['city'] ?? '');
if ($city) $updates[] = "city='$city'";

$address = $conn->real_escape_string($data['address'] ?? '');
if ($address) $updates[] = "address='$address'";

if (empty($updates)) {
    echo json_encode(["success" => false, "message" => "No hay datos para actualizar"]);
    exit;
}

$sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE username='$username'";

if ($conn->query($sql)) {
    echo json_encode(["success" => true, "message" => "Datos actualizados"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar"]);
}
?>
