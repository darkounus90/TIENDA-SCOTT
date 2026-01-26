<?php
// register.php - registro de usuario
header('Content-Type: application/json');
require 'db.php';


// Priorizar $_POST (formulario clásico), solo usar JSON si $_POST está vacío
$username = $conn->real_escape_string($_POST['username'] ?? '');
$email = $conn->real_escape_string($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
if (!$username || !$email || !$password) {
    // Si $_POST está vacío, intentar JSON
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $conn->real_escape_string($data['username'] ?? '');
    $email = $conn->real_escape_string($data['email'] ?? '');
    $password = $data['password'] ?? '';
}

if (!$username || !$email || !$password) {
    echo json_encode(["success" => false, "message" => "Usuario, correo y contraseña requeridos"]);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Correo electrónico inválido",
        "debug_email" => $email
    ]);
    exit;
}
$res = $conn->query("SELECT id FROM users WHERE username='$username' OR email='$email'");
if ($res->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "El usuario o correo ya existen"]);
    exit;
}
$hashed = password_hash($password, PASSWORD_DEFAULT);
if ($conn->query("INSERT INTO users (username, email, password, isAdmin) VALUES ('$username', '$email', '$hashed', 0)")) {
    echo json_encode(["success" => true, "message" => "Usuario registrado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al registrar usuario"]);
}
?>