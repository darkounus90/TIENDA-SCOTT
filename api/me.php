<?php
// api/me.php - Get current user details
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

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

// Get Token
$auth = getAuthHeader();
$token = null;

if ($auth) {
    $token = str_replace('Bearer ', '', $auth);
} elseif (isset($_GET['token'])) {
    $token = $_GET['token'];
    // Fix: Si el token viene por GET y PHP convirtió '+' en espacios, restaurarlos
    // Un token Base64 válido no tiene espacios.
    if (strpos($token, ' ') !== false) {
        $token = str_replace(' ', '+', $token);
    }
}

if (!$token) {
    echo json_encode(['success' => false, 'message' => 'No token provided (Headers or URL)']);
    exit;
}

// Decode simulated token
$parts = explode('.', $token);
if (count($parts) < 2) {
     echo json_encode(['success' => false, 'message' => 'Invalid token format']);
     exit;
}
$payload = json_decode(base64_decode($parts[0]), true);
$username = $conn->real_escape_string($payload['username'] ?? '');

if (!$username) {
    echo json_encode(['success' => false, 'message' => 'Invalid token payload']);
    exit;
}

// Fetch fresh data
$sql = "SELECT * FROM users WHERE username = '$username'";
$result = $conn->query($sql);

if ($result && $row = $result->fetch_assoc()) {
    // Return safe data
    $user = [
        'id' => $row['id'],
        'username' => $row['username'],
        'email' => $row['email'],
        'phone' => $row['phone'] ?? '',
        'department' => $row['department'] ?? '',
        'city' => $row['city'] ?? '',
        'address' => $row['address'] ?? '',
        'profile_photo' => $row['profile_photo'] ?? '',
        'isAdmin' => (int)($row['isAdmin'] ?? 0)
    ];
    echo json_encode(['success' => true, 'user' => $user]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
?>
