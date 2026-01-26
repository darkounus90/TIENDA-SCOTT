<?php
// register.php - registro de usuario
header('Content-Type: application/json');
require 'db.php';


// Permitir tanto JSON como x-www-form-urlencoded
if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $conn->real_escape_string($data['username'] ?? '');
    $email = $conn->real_escape_string($data['email'] ?? '');
    $password = $data['password'] ?? '';
} else {
    $username = $conn->real_escape_string($_POST['username'] ?? '');
    $email = $conn->real_escape_string($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
}

if (!$username || !$email || !$password) {
    echo json_encode(["success" => false, "message" => "Usuario, correo y contraseña requeridos"]);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Correo electrónico inválido"]);
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