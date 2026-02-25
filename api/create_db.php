<?php
require 'db.php';

// Mostrar errores temporalmente para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🛠️ Herramienta de Reparación de Base de Datos</h1>";

try {
    // 1. Crear tabla de productos (products)
    $sql_products = "
    CREATE TABLE IF NOT EXISTS `products` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `name` VARCHAR(255) NOT NULL,
      `brand` VARCHAR(100) DEFAULT NULL,
      `category` VARCHAR(100) DEFAULT NULL,
      `price` DECIMAL(12,2) NOT NULL DEFAULT '0.00',
      `stock` INT(11) NOT NULL DEFAULT '0',
      `use_type` VARCHAR(150) DEFAULT NULL,
      `tag` VARCHAR(100) DEFAULT NULL,
      `barcode` VARCHAR(100) DEFAULT NULL,
      `images` LONGTEXT DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    if ($conn->query($sql_products) === TRUE) {
        echo "<p style='color:green;'>✅ La tabla <b>products</b> se reparó/creó con éxito.</p>";
    } else {
        echo "<p style='color:red;'>❌ Error al crear tabla products: " . $conn->error . "</p>";
    }

    // 2. Crear tabla de servicios (services) - por si acaso tampoco existe
    $sql_services = "
    CREATE TABLE IF NOT EXISTS `services` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `service_type` VARCHAR(255) NOT NULL,
      `customer_name` VARCHAR(255) NOT NULL,
      `customer_phone` VARCHAR(50) DEFAULT NULL,
      `bike_details` VARCHAR(255) DEFAULT NULL,
      `status` VARCHAR(50) DEFAULT 'Pendiente',
      `cost` DECIMAL(12,2) DEFAULT '0.00',
      `images` LONGTEXT DEFAULT NULL,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    if ($conn->query($sql_services) === TRUE) {
        echo "<p style='color:green;'>✅ La tabla <b>services</b> (Reparaciones) se reparó/creó con éxito.</p>";
    } else {
        echo "<p style='color:red;'>❌ Error al crear tabla services: " . $conn->error . "</p>";
    }
    
    echo "<hr>";
    echo "<h3>¡Todo listo!</h3>";
    echo "<p>Ya puedes volver al panel de administración y subir el producto sin errores.</p>";
    echo "<p><i>*Por seguridad, elimina este archivo (create_db.php) de Github después de usarlo o déjalo ahí si no guarda información sensible.</i></p>";

} catch (Exception $e) {
    echo "<p style='color:red;'>Error crítico: " . $e->getMessage() . "</p>";
}

$conn->close();
?>
