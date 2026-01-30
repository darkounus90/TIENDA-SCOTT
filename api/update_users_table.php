<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require 'db.php';

// Añadir columna phone si no existe
$sql = "SHOW COLUMNS FROM users LIKE 'phone'";
$result = $conn->query($sql);

if ($result && $result->num_rows === 0) {
    // La columna no existe, la creamos
    $alter = "ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL";
    if ($conn->query($alter)) {
        echo "<h2 style='color:green'>Columna 'phone' añadida correctamente a la tabla 'users'.</h2>";
    } else {
        echo "<h2 style='color:red'>Error añadiendo columna 'phone': " . $conn->error . "</h2>";
    }
} else {
    echo "<h2 style='color:orange'>La columna 'phone' ya existe. Todo OK.</h2>";
}
?>
