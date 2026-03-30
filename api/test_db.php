<?php
require 'auth_helper.php';
setCorsHeaders();
requireAdmin();
require 'db.php';
header('Content-Type: application/json');
echo json_encode(["success" => true, "message" => "Database connection is working"]);
?>
