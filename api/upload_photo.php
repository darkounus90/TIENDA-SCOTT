<?php
// upload_photo.php - Subir foto de perfil del usuario
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require 'db.php';

// Autenticación robusta
function getAuthHeader() {
    $headers = null;
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) return $headers['Authorization'];
        if (isset($headers['authorization'])) return $headers['authorization'];
    }
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) return $_SERVER['HTTP_AUTHORIZATION'];
    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    return null;
}

$auth = getAuthHeader();
if (!$auth || !preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
    echo json_encode(["success" => false, "message" => "No autorizado (Token faltante o inválido)"]);
    exit;
}
$token = $matches[1];
$payload = json_decode(base64_decode(explode('.', $token)[0]), true);
$username = $payload['username'] ?? '';

if (!$username) {
    echo json_encode(["success" => false, "message" => "Token inválido"]);
    exit;
}

// Recibir imagen como Base64
$data = json_decode(file_get_contents('php://input'), true);
$photoData = $data['photo'] ?? '';

if (!$photoData) {
    echo json_encode(["success" => false, "message" => "No se recibió imagen"]);
    exit;
}

// Validar que sea una imagen Base64 válida
if (!preg_match('/^data:image\/(jpeg|png|gif|webp);base64,/', $photoData, $imgMatches)) {
    echo json_encode(["success" => false, "message" => "Formato de imagen no válido"]);
    exit;
}

$extension = $imgMatches[1];
$base64Clean = preg_replace('/^data:image\/\w+;base64,/', '', $photoData);
$imageBytes = base64_decode($base64Clean);

if (!$imageBytes || strlen($imageBytes) > 2 * 1024 * 1024) {
    echo json_encode(["success" => false, "message" => "La imagen no debe superar 2MB"]);
    exit;
}

// Crear directorio de fotos si no existe
$uploadDir = __DIR__ . '/../uploads/profiles/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generar nombre único
$filename = 'profile_' . md5($username . time()) . '.' . $extension;
$filepath = $uploadDir . $filename;

// Guardar archivo
if (!file_put_contents($filepath, $imageBytes)) {
    echo json_encode(["success" => false, "message" => "Error al guardar la imagen"]);
    exit;
}

// Ruta relativa para el frontend
$relativePath = 'uploads/profiles/' . $filename;

// Eliminar foto anterior si existe
$stmt = $conn->prepare("SELECT profile_photo FROM users WHERE username=?");
$stmt->bind_param("s", $username);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows > 0) {
    $oldUser = $res->fetch_assoc();
    $oldPhoto = $oldUser['profile_photo'] ?? '';
    if ($oldPhoto && file_exists(__DIR__ . '/../' . $oldPhoto)) {
        unlink(__DIR__ . '/../' . $oldPhoto);
    }
}

// Actualizar en la base de datos
$stmt2 = $conn->prepare("UPDATE users SET profile_photo=? WHERE username=?");
$stmt2->bind_param("ss", $relativePath, $username);

if ($stmt2->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Foto de perfil actualizada",
        "photo_url" => $relativePath
    ]);
} else {
    // Si falla el DB, eliminar el archivo subido
    unlink($filepath);
    echo json_encode(["success" => false, "message" => "Error al actualizar la base de datos"]);
}
?>
