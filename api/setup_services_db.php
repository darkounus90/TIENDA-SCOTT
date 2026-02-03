<?php
require_once 'db.php';

// Crear tabla de servicios
$sqlServices = "CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bike_model VARCHAR(100) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('recibido', 'en_proceso', 'listo', 'entregado') DEFAULT 'recibido',
    cost DECIMAL(10,2) DEFAULT 0,
    entry_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;";

if ($conn->query($sqlServices) === TRUE) {
    echo "Tabla 'services' creada o validada correctamente.<br>";
} else {
    echo "Error creando tabla services: " . $conn->error . "<br>";
}

// Crear tabla de imágenes de servicio
$sqlImages = "CREATE TABLE IF NOT EXISTS service_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    image_data LONGTEXT, -- Base64
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;";

if ($conn->query($sqlImages) === TRUE) {
    echo "Tabla 'service_images' creada o validada correctamente.<br>";
} else {
    echo "Error creando tabla service_images: " . $conn->error . "<br>";
}

$conn->close();
?>
