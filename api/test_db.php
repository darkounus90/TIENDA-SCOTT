<?php
// api/test_db.php
header('Content-Type: application/json');

include 'config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);

if ($conn->connect_error) {
    echo json_encode([
        "success" => false, 
        "message" => "Connection failed to server: " . $conn->connect_error
    ]);
    exit;
}

if (!$conn->select_db(DB_NAME)) {
    echo json_encode([
        "success" => false, 
        "message" => "Connected to server, but database '" . DB_NAME . "' not found."
    ]);
    exit;
}

echo json_encode([
    "success" => true, 
    "message" => "Successfully connected to database '" . DB_NAME . "'"
]);
