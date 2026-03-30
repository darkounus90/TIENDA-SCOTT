<?php
require 'db.php';
header('Content-Type: application/json');
echo json_encode(["success" => true, "message" => "Database connection is working", "host" => $host]);
?>
