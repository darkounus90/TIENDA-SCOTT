<?php
// update_role.php - cambiar rol de usuario

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

require 'db.php';

function getAuthHeader() {
    $headers = null;
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) return $headers['Authorization'];
        if (isset($headers['authorization'])) return $headers['authorization'];
    }
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) return $_SERVER['HTTP_AUTHORIZATION'];
    return null;
}

$data = json_decode(file_get_contents('php://input'), true);
$targetId = intval($data['id'] ?? 0);
$targetIsAdmin = intval($data['isAdmin'] ?? 0);

$auth = getAuthHeader();
if (!$auth) {
    echo json_encode(["message" => "No token provided"]);
    exit;
}

$token = str_replace('Bearer ', '', $auth);
$parts = explode('.', $token);
if (count($parts) < 2) {
    echo json_encode(["message" => "Invalid token"]);
    exit;
}

$payload = json_decode(base64_decode($parts[0]), true);
$adminUser = $conn->real_escape_string($payload['username'] ?? '');

// Verify requester is admin
$res = $conn->query("SELECT isAdmin FROM users WHERE username='$adminUser'");
if ($res->num_rows === 0) {
    echo json_encode(["message" => "Usuario no encontrado"]);
    exit;
}
$user = $res->fetch_assoc();
if ($user['isAdmin'] != 1) {
    echo json_encode(["message" => "Solo administradores"]);
    exit;
}

$conn->query("UPDATE users SET isAdmin=$targetIsAdmin WHERE id=$targetId");
echo json_encode(["message" => "Rol actualizado correctamente"]);
?>