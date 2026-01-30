<?php
// api/me.php - Get current user details
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require 'db.php';

// Get Token
$headers = apache_request_headers();
$auth = $headers['Authorization'] ?? '';
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
        'isAdmin' => (bool)$row['isAdmin']
    ];
    echo json_encode(['success' => true, 'user' => $user]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}
?>
