<?php
require 'auth_helper.php';
setCorsHeaders();
requireAdmin();
require 'db.php';
$res = $conn->query("SELECT * FROM products");
$rows = [];
while($r = $res->fetch_assoc()){
    $rows[] = $r;
}
echo json_encode($rows);
?>
