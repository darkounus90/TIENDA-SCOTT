<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require 'db.php';

$sql = "CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  isAdmin TINYINT(1) NOT NULL DEFAULT 0
)";

if ($conn->query($sql) === TRUE) {
  echo "Table 'users' created successfully or already exists.";
} else {
  echo "Error creating table: " . $conn->error;
}
?>
