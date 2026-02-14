<?php
// api/migrate.php
// Script unificado para actualizar la base de datos
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require 'db.php';

$results = [];

// 1. Helper function
function addColumn($conn, $table, $column, $definition) {
    $check = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
    if ($check && $check->num_rows > 0) {
        return "ℹ️ La columna '$column' ya existe.";
    }
    
    $sql = "ALTER TABLE `$table` ADD COLUMN $column $definition";
    if ($conn->query($sql)) {
        return "✅ Columna '$column' agregada exitosamente.";
    } else {
        return "❌ Error agregando '$column': " . $conn->error;
    }
}

// 2. Ejecutar migraciones
$results[] = addColumn($conn, 'users', 'google_id', "VARCHAR(255) DEFAULT NULL");
$results[] = addColumn($conn, 'users', 'profile_photo', "VARCHAR(500) DEFAULT NULL");

echo json_encode([
    "success" => true,
    "message" => "Migración completada",
    "details" => $results
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
