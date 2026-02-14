<?php
// google_login.php - Login/registro con Google
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
$credential = $data['credential'] ?? '';

if (!$credential) {
    echo json_encode(["success" => false, "message" => "Token de Google requerido"]);
    exit;
}

// Decodificar el JWT de Google (sin librería externa)
$parts = explode('.', $credential);
if (count($parts) !== 3) {
    echo json_encode(["success" => false, "message" => "Token inválido"]);
    exit;
}

$payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);

if (!$payload || !isset($payload['email']) || !isset($payload['sub'])) {
    echo json_encode(["success" => false, "message" => "No se pudo decodificar el token de Google"]);
    exit;
}

// Verificar que el token no esté expirado
if (isset($payload['exp']) && $payload['exp'] < time()) {
    echo json_encode(["success" => false, "message" => "Token de Google expirado"]);
    exit;
}

$google_id = $payload['sub'];
$email = $payload['email'];
$name = $payload['name'] ?? $payload['given_name'] ?? explode('@', $email)[0];
$picture = $payload['picture'] ?? '';

// Buscar si el usuario ya existe por email o google_id
$stmt = $conn->prepare("SELECT id, username, email, phone, isAdmin, google_id FROM users WHERE email=? OR google_id=?");
$stmt->bind_param("ss", $email, $google_id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    // Usuario existente - actualizar google_id si no lo tiene
    $user = $res->fetch_assoc();
    
    if (empty($user['google_id'])) {
        $updateStmt = $conn->prepare("UPDATE users SET google_id=? WHERE id=?");
        $updateStmt->bind_param("si", $google_id, $user['id']);
        $updateStmt->execute();
    }
    
    unset($user['google_id']);
    $user['isAdmin'] = (int)$user['isAdmin'];
    
} else {
    // Nuevo usuario - registrar con Google
    $username = preg_replace('/[^a-zA-Z0-9]/', '', $name);
    
    // Verificar que el nombre de usuario no esté tomado
    $checkStmt = $conn->prepare("SELECT id FROM users WHERE username=?");
    $checkStmt->bind_param("s", $username);
    $checkStmt->execute();
    if ($checkStmt->get_result()->num_rows > 0) {
        $username = $username . '_' . substr($google_id, -4);
    }
    
    // Crear contraseña aleatoria (el usuario no la necesitará porque usa Google)
    $randomPass = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
    
    $insertStmt = $conn->prepare("INSERT INTO users (username, email, password, google_id, isAdmin) VALUES (?, ?, ?, ?, 0)");
    $insertStmt->bind_param("ssss", $username, $email, $randomPass, $google_id);
    
    if (!$insertStmt->execute()) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al registrar usuario: " . $conn->error]);
        exit;
    }
    
    $user = [
        'id' => $conn->insert_id,
        'username' => $username,
        'email' => $email,
        'phone' => '',
        'isAdmin' => 0
    ];
}

// Generar token (mismo sistema que login.php)
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
    "message" => "Login con Google exitoso",
    "user" => $user,
    "token" => $token
]);
?>
