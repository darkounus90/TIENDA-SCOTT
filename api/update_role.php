<?php
// update_role.php - cambiar rol de usuario
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = $conn->real_escape_string($data['username'] ?? '');
$password = $data['password'] ?? '';
$id = intval($data['id'] ?? 0);
isAdmin = intval($data['isAdmin'] ?? 0);

// Solo admin puede cambiar roles
$res = $conn->query("SELECT isAdmin FROM users WHERE username='$username'");
if ($res->num_rows === 0) {
    echo json_encode(["message" => "Usuario no encontrado"]);
    exit;
}
$user = $res->fetch_assoc();
if ($user['isAdmin'] != 1) {
    echo json_encode(["message" => "Solo administradores"]);
    exit;
}
$conn->query("UPDATE users SET isAdmin=$isAdmin WHERE id=$id");
echo json_encode(["message" => "Rol actualizado correctamente"]);
?>