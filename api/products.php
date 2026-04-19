<?php
// products.php - Gestión completa de productos
require 'auth_helper.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require 'db.php';

// --- GET: Listar productos ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Endpoint Metadata para Datalists
    if (isset($_GET['action']) && $_GET['action'] === 'metadata') {
        $brands = [];
        $cats = [];
        
        $resB = $conn->query("SELECT DISTINCT brand FROM products WHERE brand != '' ORDER BY brand ASC");
        while($r = $resB->fetch_assoc()) $brands[] = $r['brand'];
        
        $resC = $conn->query("SELECT DISTINCT category FROM products WHERE category != '' ORDER BY category ASC");
        while($r = $resC->fetch_assoc()) $cats[] = $r['category'];
        
        echo json_encode(['success' => true, 'brands' => $brands, 'categories' => $cats]);
        exit;
    }

    $category = $conn->real_escape_string($_GET['category'] ?? '');
    $search = $conn->real_escape_string($_GET['search'] ?? '');
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $recommended = isset($_GET['recommended']) && $_GET['recommended'] === '1' ? 1 : 0;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 0; // 0 means no limit (backward compatibility)
    
    $where = " WHERE 1=1";
    
    if ($id > 0) {
        $where .= " AND id = $id";
    } else {
        if ($category && $category !== 'all') {
            $where .= " AND category = '$category'";
        }
        
        if ($search) {
            $where .= " AND (name LIKE '%$search%' OR brand LIKE '%$search%' OR tag LIKE '%$search%' OR barcode LIKE '%$search%')";
        }

        if (isset($_GET['recommended'])) {
            $where .= " AND is_recommended = 1";
        }
    }
    
    // Count total products for this query (without pagination)
    $countRes = $conn->query("SELECT COUNT(*) as total FROM products $where");
    $totalCount = ($countRes) ? (int)$countRes->fetch_assoc()['total'] : 0;

    $sql = "SELECT * FROM products $where ORDER BY id DESC";
    
    if ($limit > 0 && $id <= 0) {
        $offset = ($page - 1) * $limit;
        $sql .= " LIMIT $limit OFFSET $offset";
    }
    
    $result = $conn->query($sql);
    $products = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Decodificar imágenes
            $imgs = json_decode($row['images'] ?? '[]', true);
            $row['images'] = is_array($imgs) ? $imgs : [];
            $row['image'] = count($row['images']) > 0 ? $row['images'][0] : '';
            
            // Compatibilidad use -> use_type
            if (!isset($row['use'])) {
                $row['use'] = $row['use_type'] ?? ''; 
            }
            $products[] = $row;
        }
    }

    if ($limit > 0 && $id <= 0) {
        echo json_encode([
            "success" => true,
            "products" => $products,
            "total" => $totalCount,
            "page" => $page,
            "limit" => $limit,
            "hasMore" => ($offset + $limit) < $totalCount
        ]);
    } else {
        if ($id > 0) {
            echo json_encode(["success" => true, "product" => ($products[0] ?? null)]);
        } else {
            echo json_encode($products);
        }
    }
    exit;
}

// --- POST: Crear Producto (Solo Admin) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAdmin(); // Verifica token firmado Y que isAdmin === 1

    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = $conn->real_escape_string($data['name'] ?? '');
    $brand = $conn->real_escape_string($data['brand'] ?? '');
    $category = $conn->real_escape_string($data['category'] ?? '');
    $price = (float)($data['price'] ?? 0);
    $tag = $conn->real_escape_string($data['tag'] ?? '');
    $use_type = $conn->real_escape_string($data['use'] ?? '');
    $stock = (int)($data['stock'] ?? 0);
    $barcode = $conn->real_escape_string($data['barcode'] ?? '');
    $description = $conn->real_escape_string($data['description'] ?? '');
    $images = $data['images'] ?? []; // Array de Base64 strings
    $is_recommended = isset($data['is_recommended']) ? (int)$data['is_recommended'] : 0;

    if (!$name || !$price) {
        echo json_encode(["success" => false, "message" => "Nombre y precio requeridos"]);
        exit;
    }

    // Convertir array de imágenes a JSON para guardar
    $imagesJson = $conn->real_escape_string(json_encode($images));

    $sql = "INSERT INTO products (name, brand, category, price, tag, use_type, stock, barcode, description, images, is_recommended) 
            VALUES ('$name', '$brand', '$category', $price, '$tag', '$use_type', $stock, '$barcode', '$description', '$imagesJson', $is_recommended)";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Producto guardado", "id" => $conn->insert_id]);
    } else {
        echo json_encode(["success" => false, "message" => "Error DB: " . $conn->error]);
    }
    exit;
}

// --- DELETE: Eliminar producto (Solo Admin) ---
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireAdmin();
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

// --- PUT: Actualizar Producto (Solo Admin) ---
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAdmin();
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
    $description = $conn->real_escape_string($data['description'] ?? '');
    $is_recommended = isset($data['is_recommended']) ? (int)$data['is_recommended'] : 0;
    $use_type = $conn->real_escape_string($data['use'] ?? '');
    
    // Solo actualizar imágenes si se envían nuevas
    $imagesSql = "";
    if (isset($data['images']) && is_array($data['images']) && count($data['images']) > 0) {
        $imagesJson = $conn->real_escape_string(json_encode($data['images']));
        $imagesSql = ", images='$imagesJson'";
    }

    $sql = "UPDATE products SET 
            name='$name', brand='$brand', category='$category', 
            price=$price, tag='$tag', stock=$stock, barcode='$barcode', description='$description',
            is_recommended=$is_recommended, use_type='$use_type'
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
