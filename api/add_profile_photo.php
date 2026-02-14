<?php
// Migración: agregar profile_photo a tabla users
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require 'db.php';

$sql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500) DEFAULT NULL";
if ($conn->query($sql)) {
    echo json_encode(["success" => true, "message" => "Columna profile_photo agregada exitosamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}
?>
