<?php
// login.php - login de usuario
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
// Fallback to $_POST just in case
if (!$data && $_POST) $data = $_POST;

$username = $conn->real_escape_string($data['username'] ?? ''); // This can now be username or email
$password = $data['password'] ?? '';

if (!$username || !$password) {
    echo json_encode(["success" => false, "message" => "Usuario/Correo y contraseña requeridos"]);
    exit;
}
// Check both username and email columns using prepared statement
$stmt = $conn->prepare("SELECT id, username, email, phone, password, isAdmin, profile_photo FROM users WHERE username=? OR email=?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de preparación de consulta"]);
    exit;
}

$stmt->bind_param("ss", $username, $username);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    exit;
}
$user = $res->fetch_assoc();
if (!password_verify($password, $user['password'])) {
    echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
    exit;
}
unset($user['password']);
$user['isAdmin'] = (int)$user['isAdmin'];
// Simular un token simple (NO JWT real, solo para frontend)
$tokenPayload = base64_encode(json_encode([
    'username' => $user['username'],
    'email' => $user['email'],
    'phone' => $user['phone'] ?? '',
    'isAdmin' => $user['isAdmin'],
    'iat' => time()
]));
$token = $tokenPayload . '.' . md5($tokenPayload . 'SALT');
echo json_encode([
    "success" => true,
    "message" => "Login exitoso",
    "user" => $user,
    "token" => $token
]);
?>