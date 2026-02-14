<?php
// api/migrate.php
// Script unificado para actualizar la base de datos
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require 'db.php';

$results = [];

// 1. Agregar google_id
$sql1 = "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) DEFAULT NULL";
if ($conn->query($sql1)) {
    $results[] = "✅ Columna 'google_id' verificada/agregada.";
} else {
    $results[] = "❌ Error en 'google_id': " . $conn->error;
}

// 2. Agregar profile_photo
$sql2 = "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500) DEFAULT NULL";
if ($conn->query($sql2)) {
    $results[] = "✅ Columna 'profile_photo' verificada/agregada.";
} else {
    $results[] = "❌ Error en 'profile_photo': " . $conn->error;
}

echo json_encode([
    "success" => true,
    "message" => "Migración completada",
    "details" => $results
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
