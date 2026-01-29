<?php
// products.php - obtener o guardar productos
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';

// GET: Listar productos
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM products"; // Asumiendo que la tabla se llama 'products'
    $result = $conn->query($sql);
    
    $products = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
    }
    echo json_encode($products);
    exit;
}

// POST: Crear producto (simplificado para admin)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Aquí iría la validación de token y lógica de inserción
    // Por ahora retornamos error si no se implementa completo
    echo json_encode(["success" => false, "message" => "Funcionalidad de guardar producto pendiente de implementación completa en PHP"]);
    exit;
}
?>
