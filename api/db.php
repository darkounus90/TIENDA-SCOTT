<?php
// db.php - conexión a MySQL
$host = 'localhost';
$user = 'c2721903_scott';
$pass = 'danida50PE';
$db = 'c2721903_scott';
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die(json_encode(["error" => "Error de conexión a MySQL"]));
}
?>