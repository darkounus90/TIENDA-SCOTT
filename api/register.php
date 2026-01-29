<?php
// register.php - registro de usuario
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';

// Leer JSON raw input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Fallback a $_POST si no es JSON (por compatibilidad)
if (!$data) {
    $data = $_POST;
}

$username = $conn->real_escape_string(trim($data['username'] ?? ''));
$email = $conn->real_escape_string(trim($data['email'] ?? ''));
$password = trim($data['password'] ?? '');

if (!$username || !$email || !$password) {
    echo json_encode(["success" => false, "message" => "Usuario, correo y contraseña requeridos"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Correo electrónico inválido"]);
    exit;
}

// Verificar existencia
$checkSql = "SELECT id FROM users WHERE username='$username' OR email='$email'";
$checkRes = $conn->query($checkSql);

if ($checkRes && $checkRes->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "El usuario o correo ya existen"]);
    exit;
}

// Hash password
$hashed = password_hash($password, PASSWORD_DEFAULT);

// Insertar
$sql = "INSERT INTO users (username, email, password, isAdmin) VALUES ('$username', '$email', '$hashed', 0)";
if ($conn->query($sql)) {
    echo json_encode(["success" => true, "message" => "Usuario registrado correctamente"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $conn->error]);
}
?>