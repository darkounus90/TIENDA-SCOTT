<?php
// api/update_users_table.php
header('Content-Type: text/plain');
require 'db.php';

// Array of columns to add
$columns_to_add = [
    "phone" => "VARCHAR(20) DEFAULT NULL",
    "department" => "VARCHAR(100) DEFAULT NULL",
    "city" => "VARCHAR(100) DEFAULT NULL",
    "address" => "VARCHAR(255) DEFAULT NULL",
    "isAdmin" => "TINYINT(1) NOT NULL DEFAULT 0"
];

echo "Iniciando revisión de columnas en la tabla 'users'...\n";

foreach ($columns_to_add as $col => $def) {
    // Check if column exists
    $check = $conn->query("SHOW COLUMNS FROM users LIKE '$col'");
    if ($check->num_rows == 0) {
        $sql = "ALTER TABLE users ADD COLUMN $col $def";
        if ($conn->query($sql) === TRUE) {
            echo "✅ Column '$col' added successfully.\n";
        } else {
            echo "❌ Error adding column '$col': " . $conn->error . "\n";
        }
    } else {
        echo "ℹ️ Column '$col' already exists.\n";
    }
}

echo "Done.";
?>
