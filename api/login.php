<?php
// login.php - login de usuario
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = $conn->real_escape_string($data['username'] ?? '');
$password = $data['password'] ?? '';

if (!$username || !$password) {
    echo json_encode(["message" => "Usuario y contraseña requeridos"]);
    exit;
}
$res = $conn->query("SELECT id, username, email, password, isAdmin FROM users WHERE username='$username'");
if ($res->num_rows === 0) {
    echo json_encode(["message" => "Usuario no encontrado"]);
    exit;
}
$user = $res->fetch_assoc();
if (!password_verify($password, $user['password'])) {
    echo json_encode(["message" => "Contraseña incorrecta"]);
    exit;
}
// No JWT, solo datos básicos
unset($user['password']);
echo json_encode(["user" => $user]);
?>