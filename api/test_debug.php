<?php
// api/test_debug.php
header('Content-Type: application/json');
require 'db.php';

$admins = [];
$res = $conn->query("SELECT id, username, email, isAdmin FROM users WHERE isAdmin = 1");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $admins[] = $row;
    }
}

echo json_encode([
    "message" => "Debug Info",
    "admins_found" => count($admins),
    "admin_list" => $admins,
    "db_connection" => $conn->connect_error ? "Error" : "OK"
]);
?>
