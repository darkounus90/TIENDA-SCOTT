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
if (!$auth) {
    echo json_encode(['success' => false, 'message' => 'No token provided']);
    exit;
}

$token = str_replace('Bearer ', '', $auth);
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
$sql = "SELECT id, username, email, phone, department, city, address, isAdmin FROM users WHERE username = '$username'";
$result = $conn->query($sql);

if ($result && $row = $result->fetch_assoc()) {
    // Return safe data
    $user = [
        'id' => $row['id'],
        'username' => $row['username'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'department' => $row['department'],
        'city' => $row['city'],
        'address' => $row['address'],
        'isAdmin' => (int)$row['isAdmin']
    ];
    echo json_encode(['success' => true, 'user' => $user]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
?>
