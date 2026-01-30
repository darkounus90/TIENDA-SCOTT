<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require 'db.php';

// Add columns for address info to users table
$cols = ['department', 'city', 'address'];
foreach ($cols as $col) {
    $check = $conn->query("SHOW COLUMNS FROM users LIKE '$col'");
    if ($check->num_rows == 0) {
        $sql = "ALTER TABLE users ADD COLUMN $col VARCHAR(100)";
        if ($conn->query($sql)) {
            echo "✅ Columna '$col' agregada a tabla users.<br>";
        } else {
            echo "❌ Error agregando '$col': " . $conn->error . "<br>";
        }
    } else {
        echo "ℹ️ Columna '$col' ya existe.<br>";
    }
}
?>
