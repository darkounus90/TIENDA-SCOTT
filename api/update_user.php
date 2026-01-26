<?php
// update_user.php - Actualizar email del usuario logueado
header('Content-Type: application/json');
require 'db.php';

// Autenticación simple por token (simulado)
$headers = getallheaders();
$auth = $headers['Authorization'] ?? '';
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
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Email inválido"]);
    exit;
}

if ($conn->query("UPDATE users SET email='$email' WHERE username='$username'")) {
    echo json_encode(["success" => true, "message" => "Email actualizado"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar"]);
}
?>
