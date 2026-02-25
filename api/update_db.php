<?php
require 'db.php';

// Mostrar errores temporalmente para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🛠️ Actualización de Base de Datos</h1>";

try {
    // Agregar columna description si no existe
    $sql_alter = "ALTER TABLE `products` ADD COLUMN `description` TEXT DEFAULT NULL AFTER `category`;";

    if ($conn->query($sql_alter) === TRUE) {
        echo "<p style='color:green;'>✅ Se agregó la columna <b>description</b> a la tabla products.</p>";
    } else {
        echo "<p style='color:orange;'>⚠️ (Ignorar si dice Duplicate) Mensaje: " . $conn->error . "</p>";
    }

    echo "<hr><h3>¡Actualización completada!</h3>";

} catch (Exception $e) {
    echo "<p style='color:red;'>Error crítico: " . $e->getMessage() . "</p>";
}

$conn->close();
?>
