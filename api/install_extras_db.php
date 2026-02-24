<?php
// api/install_extras_db.php - Instalar formularios/tablas adicionales (Reseñas)
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/html; charset=UTF-8");

require 'config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

echo "<h2>Actualizando Base de Datos...</h2>";

// Crear tabla de Reseñas / Comentarios (Reviews)
$sqlReviews = "CREATE TABLE IF NOT EXISTS product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NULL,
    user_name VARCHAR(150) NOT NULL,
    rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    status VARCHAR(20) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

if ($conn->query($sqlReviews) === TRUE) {
    echo "<p>✅ Tabla 'product_reviews' (Formulario de Reseñas) verificada/creada exitosamente.</p>";
} else {
    echo "<p>❌ Error creando 'product_reviews': " . $conn->error . "</p>";
}

// Alterando tabla de orders para agregar estado detallado y notas (Gestión detallada de pedidos)
$sqlAlterOrders = "ALTER TABLE orders ADD COLUMN admin_notes TEXT NULL;";
$conn->query($sqlAlterOrders); // Fallará si ya existe, lo cual es seguro ignorar.

echo "<p>✅ Módulos adicionales registrados.</p>";
echo "<p><strong>¡Proceso completado exitosamente!</strong> Ya puedes usar las nuevas funciones.</p>";

$conn->close();
?>
