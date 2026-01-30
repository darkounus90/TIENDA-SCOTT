<?php
// install_orders_db.php - Setup Orders table for Wompi
header('Content-Type: text/html; charset=utf-8');
require 'db.php';

// 1. Create orders table if not exists
$sqlOrders = "CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, declined, error
  reference VARCHAR(100) UNIQUE,        -- Wompi unique reference
  wompi_id VARCHAR(100),                -- Wompi trans_id
  payment_method VARCHAR(50),           -- CARD, NEQUI, etc.
  currency VARCHAR(10) DEFAULT 'COP',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)";

if ($conn->query($sqlOrders) === TRUE) {
    echo "<h2>✅ Table 'orders' checked/created.</h2>";
    
    // Migration: Add columns if missing
    $cols = ['reference', 'wompi_id', 'payment_method', 'currency'];
    foreach ($cols as $col) {
        $check = $conn->query("SHOW COLUMNS FROM orders LIKE '$col'");
        if ($check->num_rows == 0) {
            $type = ($col == 'reference' || $col == 'wompi_id') ? "VARCHAR(100)" : "VARCHAR(50)";
            if ($col == 'reference') $type .= " UNIQUE";
            $conn->query("ALTER TABLE orders ADD COLUMN $col $type");
            echo "<p>➕ Added column '$col'.</p>";
        }
    }
} else {
    echo "<h2 style='color:red'>❌ Error creating 'orders': " . $conn->error . "</h2>";
}

// 2. Create order_items table
$sqlItems = "CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
)";

if ($conn->query($sqlItems) === TRUE) {
    echo "<h2>✅ Table 'order_items' checked/created.</h2>";
} else {
    echo "<h2 style='color:red'>❌ Error creating 'order_items': " . $conn->error . "</h2>";
}

$conn->close();
?>
