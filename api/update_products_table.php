<?php
// api/update_products_table.php
header('Content-Type: text/plain');
require 'db.php';

// Asegurar tabla products
$sql = "CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10,2),
    stock INT DEFAULT 0,
    tag VARCHAR(50),
    use_type VARCHAR(50),
    barcode VARCHAR(100),
    images LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Tabla products verificada.\n";
} else {
    echo "Error creando tabla products: " . $conn->error . "\n";
}

// Agregar columnas si faltan
$cols = [
    "use_type" => "VARCHAR(50)",
    "barcode" => "VARCHAR(100)",
    "images" => "LONGTEXT",
    "stock" => "INT DEFAULT 0"
];

foreach ($cols as $col => $def) {
    $check = $conn->query("SHOW COLUMNS FROM products LIKE '$col'");
    if ($check->num_rows == 0) {
        if ($conn->query("ALTER TABLE products ADD COLUMN $col $def")) {
             echo "Columna $col agregada.\n";
        } else {
             echo "Error agregando $col: " . $conn->error . "\n";
        }
    } else {
        echo "Columna $col ya existe.\n";
    }
}
echo "Actualización de DB terminada.\n";
?>
