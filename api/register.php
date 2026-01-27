// Depuración: guardar datos recibidos
file_put_contents('debug.txt', 'POST: ' . print_r($_POST, true) . PHP_EOL, FILE_APPEND);
file_put_contents('debug.txt', 'RAW: ' . file_get_contents('php://input') . PHP_EOL, FILE_APPEND);

// Depuración extra: registrar valores individuales
$debug_email = $_POST['email'] ?? '';
file_put_contents('debug.txt', 'EMAIL EN POST: ' . $debug_email . PHP_EOL, FILE_APPEND);

<?php
// register.php - registro de usuario
header('Content-Type: application/json');
require 'db.php';


// Priorizar $_POST (formulario clásico), solo usar JSON si $_POST está vacío
// Limpiar espacios con trim()
$username = $conn->real_escape_string(trim($_POST['username'] ?? ''));
$email = $conn->real_escape_string(trim($_POST['email'] ?? ''));
$password = trim($_POST['password'] ?? '');
file_put_contents('debug.txt', 'EMAIL DESPUES DE TRIM: ' . $email . PHP_EOL, FILE_APPEND);
if (!$username || !$email || !$password) {
    // Si $_POST está vacío, intentar JSON
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $conn->real_escape_string(trim($data['username'] ?? ''));
    $email = $conn->real_escape_string(trim($data['email'] ?? ''));
    $password = trim($data['password'] ?? '');
    file_put_contents('debug.txt', 'JSON: ' . print_r($data, true) . PHP_EOL, FILE_APPEND);
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
    file_put_contents('debug.txt', 'EMAIL INVALIDO: ' . $email . PHP_EOL, FILE_APPEND);
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