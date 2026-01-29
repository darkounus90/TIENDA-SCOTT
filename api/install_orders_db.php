<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require 'db.php';

// Crear tabla orders
$sqlOrders = "CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)";

if ($conn->query($sqlOrders) === TRUE) {
  echo "Table 'orders' created successfully.<br>";
} else {
  echo "Error creating table 'orders': " . $conn->error . "<br>";
}

// Crear tabla order_items
$sqlItems = "CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL, /* Asumiendo que existe una tabla products o se guarda referencia simple */
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
)";

if ($conn->query($sqlItems) === TRUE) {
  echo "Table 'order_items' created successfully.<br>";
} else {
  echo "Error creating table 'order_items': " . $conn->error . "<br>";
}
echo "Database setup completed.";
?>
