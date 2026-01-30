<?php
// db.php - conexión a MySQL
// ...existing code...
$host = 'localhost';
$user = 'c2721903_scott';
$pass = 'danida50PE';
$db = 'c2721903_scott';
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die('<h2 style="color:red">Error de conexión a MySQL</h2>');
}
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    echo '<h2 style="color:green">Conexión exitosa a la base de datos MySQL</h2>';
}
// End of file (no closing tag)