<?php
// users.php - listar usuarios (solo admin)
header('Content-Type: application/json');
require 'db.php';

// Autenticación básica por usuario admin
$data = json_decode(file_get_contents('php://input'), true);
$username = $conn->real_escape_string($data['username'] ?? '');
$password = $data['password'] ?? '';

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
$users = [];
$q = $conn->query("SELECT id, username, email, isAdmin FROM users");
while ($row = $q->fetch_assoc()) {
    $users[] = $row;
}
echo json_encode($users);
?>