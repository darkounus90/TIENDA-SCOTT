<?php
// Migración: agregar google_id a tabla users
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require 'db.php';

$sql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) DEFAULT NULL";
if ($conn->query($sql)) {
    echo json_encode(["success" => true, "message" => "Columna google_id agregada exitosamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}
?>
