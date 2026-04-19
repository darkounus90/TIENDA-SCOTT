<?php
// install_products_db.php - Instalar/Actualizar tabla de productos
header('Content-Type: text/html; charset=utf-8');
require 'db.php';

// SQL para crear/actualizar la tabla
$sql = "CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(15, 2) NOT NULL,
    tag VARCHAR(50),
    use_type VARCHAR(100),
    stock INT DEFAULT 0,
    barcode VARCHAR(100) UNIQUE,
    is_recommended TINYINT(1) DEFAULT 0,
    images JSON,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "<h2>✅ Tabla 'products' verificada/creada correctamente.</h2>";
    
    // Check if columns exist (for migration)
    $check = $conn->query("SHOW COLUMNS FROM products LIKE 'barcode'");
    if ($check->num_rows == 0) {
        $conn->query("ALTER TABLE products ADD COLUMN barcode VARCHAR(100) UNIQUE");
        echo "<p>✅ Columna 'barcode' agregada.</p>";
    }
    
    $checkImg = $conn->query("SHOW COLUMNS FROM products LIKE 'images'");
    if ($checkImg->num_rows == 0) {
        $conn->query("ALTER TABLE products ADD COLUMN images JSON");
        echo "<p>✅ Columna 'images' (JSON) agregada.</p>";
    }

    $checkRec = $conn->query("SHOW COLUMNS FROM products LIKE 'is_recommended'");
    if ($checkRec->num_rows == 0) {
        $conn->query("ALTER TABLE products ADD COLUMN is_recommended TINYINT(1) DEFAULT 0 AFTER description");
        echo "<p>✅ Columna 'is_recommended' agregada.</p>";
    }

    $checkOrder = $conn->query("SHOW COLUMNS FROM products LIKE 'recommended_order'");
    if ($checkOrder->num_rows == 0) {
        $conn->query("ALTER TABLE products ADD COLUMN recommended_order INT DEFAULT 0 AFTER is_recommended");
        echo "<p>✅ Columna 'recommended_order' agregada.</p>";
    }
    
} else {
    echo "<h2 style='color:red'>❌ Error creando tabla: " . $conn->error . "</h2>";
}

$conn->close();
?>
