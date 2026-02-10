<?php
// db.php - conexión a MySQL
// ...existing code...
$host = 'localhost';
$user = 'c2721903_scott';
$pass = 'danida50PE';
$db = 'c2721903_scott';

// Try to load local config if it exists
$configFile = __DIR__ . '/config.php';
if (file_exists($configFile)) {
    $config = require $configFile;
    $host = $config['host'] ?? $host;
    $user = $config['user'] ?? $user;
    $pass = $config['pass'] ?? $pass;
    $db   = $config['db']   ?? $db;
}

// Disable default error reporting to prevent HTML output
error_reporting(0); 
mysqli_report(MYSQLI_REPORT_OFF);

try {
    $conn = new mysqli($host, $user, $pass, $db);
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    $conn->set_charset("utf8mb4");
} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection error"]);
    exit;
}

// Only echo success if run directly for debugging, never when included
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    header('Content-Type: application/json');
    echo json_encode(["success" => true, "message" => "Database connection successful"]);
}