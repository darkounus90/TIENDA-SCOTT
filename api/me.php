<?php
// api/me.php - Get current user details
require 'auth_helper.php';
setCorsHeaders();
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

ini_set('display_errors', 0);

// Habilitar reporte de errores como JSON para depuración
ini_set('display_errors', 0);
error_reporting(E_ALL);

function json_shutdown_handler() {
    $error = error_get_last();
    if ($error && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_CORE_ERROR)) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(["success" => false, "message" => "Fatal Error: " . $error['message'] . " in line " . $error['line']]);
        exit;
    }
}
register_shutdown_function('json_shutdown_handler');

require 'db.php';

$user = requireAuth(); // Verifica firma correctamente
$userId = (int)($user['sub'] ?? 0);

// Fetch fresh data
$stmt = $conn->prepare("SELECT id, username, email, phone, department, city, address, profile_photo, isAdmin FROM users WHERE id=?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $row = $result->fetch_assoc()) {
    unset($row['password']);
    $row['isAdmin'] = (int)($row['isAdmin'] ?? 0);
    echo json_encode(['success' => true, 'user' => $row]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
?>
