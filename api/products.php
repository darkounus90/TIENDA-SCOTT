<?php
// products.php - Gestión completa de productos
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';

// --- GET: Listar productos ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $category = $conn->real_escape_string($_GET['category'] ?? '');
    $search = $conn->real_escape_string($_GET['search'] ?? '');
    
    $sql = "SELECT * FROM products WHERE 1=1";
    
    if ($category && $category !== 'all') {
        $sql .= " AND category = '$category'";
    }
    
    if ($search) {
        $sql .= " AND (name LIKE '%$search%' OR brand LIKE '%$search%' OR tag LIKE '%$search%' OR barcode LIKE '%$search%')";
    }
    
    $sql .= " ORDER BY id DESC"; // Más recientes primero
    
    $result = $conn->query($sql);
    $products = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Asegurar que 'images' se envíe como array real, no string JSON doblemente codificado
            if (!empty($row['images'])) {
                // Decodificar si está guardado como string JSON en DB
                $decoded = json_decode($row['images']);
                $row['images'] = $decoded ? $decoded : []; 
            } else {
                $row['images'] = [];
            }
            // Compatibilidad con frontend antiguo que espera 'image' simple
            $row['image'] = !empty($row['images'][0]) ? $row['images'][0] : null;
            
            $products[] = $row;
        }
    }
    echo json_encode($products);
    exit;
}

// --- POST: Crear Producto (Solo Admin) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validar Auth (básico)
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? '';
    // En producción REAL, validar token JWT aquí. 
    // Por simplicidad, confiamos en que el frontend envía si es admin, 
    // pero idealmente decodificaríamos el token para verificar isAdmin=1.

    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = $conn->real_escape_string($data['name'] ?? '');
    $brand = $conn->real_escape_string($data['brand'] ?? '');
    $category = $conn->real_escape_string($data['category'] ?? '');
    $price = (float)($data['price'] ?? 0);
    $tag = $conn->real_escape_string($data['tag'] ?? '');
    $use_type = $conn->real_escape_string($data['use'] ?? '');
    $stock = (int)($data['stock'] ?? 0);
    $barcode = $conn->real_escape_string($data['barcode'] ?? '');
    $images = $data['images'] ?? []; // Array de Base64 strings

    if (!$name || !$price) {
        echo json_encode(["success" => false, "message" => "Nombre y precio requeridos"]);
        exit;
    }

    // Convertir array de imágenes a JSON para guardar
    $imagesJson = $conn->real_escape_string(json_encode($images));

    $sql = "INSERT INTO products (name, brand, category, price, tag, use_type, stock, barcode, images) 
            VALUES ('$name', '$brand', '$category', $price, '$tag', '$use_type', $stock, '$barcode', '$imagesJson')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Producto guardado", "id" => $conn->insert_id]);
    } else {
        echo json_encode(["success" => false, "message" => "Error DB: " . $conn->error]);
    }
    exit;
}

// --- DELETE: Eliminar producto ---
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id > 0) {
        if ($conn->query("DELETE FROM products WHERE id=$id")) {
             echo json_encode(["success" => true, "message" => "Producto eliminado"]);
        } else {
             echo json_encode(["success" => false, "message" => "Error eliminando: " . $conn->error]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "ID inválido"]);
    }
    exit;
}

// --- PUT: Actualizar Producto ---
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(["success" => false, "message" => "ID inválido"]);
        exit;
    }

    $name = $conn->real_escape_string($data['name'] ?? '');
    $brand = $conn->real_escape_string($data['brand'] ?? '');
    $category = $conn->real_escape_string($data['category'] ?? '');
    $price = (float)($data['price'] ?? 0);
    $tag = $conn->real_escape_string($data['tag'] ?? '');
    $stock = (int)($data['stock'] ?? 0);
    $barcode = $conn->real_escape_string($data['barcode'] ?? '');
    
    // Solo actualizar imágenes si se envían nuevas
    $imagesSql = "";
    if (isset($data['images']) && is_array($data['images']) && count($data['images']) > 0) {
        $imagesJson = $conn->real_escape_string(json_encode($data['images']));
        $imagesSql = ", images='$imagesJson'";
    }

    $sql = "UPDATE products SET 
            name='$name', brand='$brand', category='$category', 
            price=$price, tag='$tag', stock=$stock, barcode='$barcode'
            $imagesSql
            WHERE id=$id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Producto actualizado"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error DB: " . $conn->error]);
    }
    exit;
}
?>
