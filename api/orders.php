<?php
// orders.php - Gestión de Pedidos
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require 'db.php';

// Helper: Get User from Token (Simulated/Basic)
function getUserFromToken($conn) {
    $auth = null;
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) $auth = $headers['Authorization'];
        elseif (isset($headers['authorization'])) $auth = $headers['authorization'];
    }
    if (!$auth && isset($_SERVER['HTTP_AUTHORIZATION'])) $auth = $_SERVER['HTTP_AUTHORIZATION'];
    if (!$auth && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    
    if (!$auth) return null;
    $token = str_replace('Bearer ', '', $auth);
    
    // Decode simple mock token
    $parts = explode('.', $token);
    if(count($parts) < 2) return null;
    $payload = json_decode(base64_decode($parts[0]), true);
    return $payload; // ['username' => ..., 'isAdmin' => ...]
}

$user = getUserFromToken($conn);

// --- GET: Listar Pedidos ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'No autorizado']);
        exit;
    }
    
    // Obtener ID real
    $username = $conn->real_escape_string($user['username']);
    $uRes = $conn->query("SELECT id, isAdmin FROM users WHERE username='$username'");
    if (!$uRes || $uRes->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Usuario inválido']);
        exit;
    }
    $dbUser = $uRes->fetch_assoc();
    
    // Si es Admin, listar TODO. Si no, solo suyos.
    $sql = "SELECT o.*, u.username as user_name, u.email as user_email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id ";
            
    if ($dbUser['isAdmin'] != 1) {
        $sql .= " WHERE o.user_id = " . $dbUser['id'];
    }
    
    $sql .= " ORDER BY o.created_at DESC";
    
    $result = $conn->query($sql);
    $orders = [];
    
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            // Fetch items
            $oid = $row['id'];
            $iRes = $conn->query("SELECT * FROM order_items WHERE order_id=$oid");
            $items = [];
            while($item = $iRes->fetch_assoc()) $items[] = $item;
            $row['items'] = $items;
            $orders[] = $row;
        }
    }
    
    echo json_encode(['success' => true, 'orders' => $orders, 'isAdmin' => $dbUser['isAdmin'] == 1]);
    exit;
}

// --- POST: Crear Pedido ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$user) {
         echo json_encode(['success' => false, 'message' => 'Debes iniciar sesión']);
         exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Get User ID
    $username = $conn->real_escape_string($user['username']);
    $uRes = $conn->query("SELECT id FROM users WHERE username='$username'");
    $dbUser = $uRes->fetch_assoc();
    $userId = $dbUser['id'];
    
    $items = $data['items'] ?? [];
    if (empty($items)) {
        echo json_encode(['success' => false, 'message' => 'Carrito vacío']);
        exit;
    }
    
    // Calcular total server-side
    $total = 0;
    $finalItems = [];
    
    foreach ($items as $item) {
        $pid = (int)$item['id'];
        $qty = (int)$item['qty'];
        
        $pRes = $conn->query("SELECT price, name, stock FROM products WHERE id=$pid");
        if ($pRes && $row = $pRes->fetch_assoc()) {
            if ($row['stock'] < $qty) {
                 echo json_encode(['success' => false, 'message' => "Stock insuficiente para {$row['name']}"]);
                 exit;
            }
            $price = (float)$row['price'];
            $total += $price * $qty;
            $finalItems[] = [
                'id' => $pid,
                'name' => $row['name'],
                'price' => $price,
                'qty' => $qty
            ];
        }
    }
    
    // Generar Referencia
    $reference = 'ORD-' . time() . '-' . rand(1000, 9999);
    
    // Insert Order
    $sql = "INSERT INTO orders (user_id, total, status, reference, created_at) VALUES ($userId, $total, 'pending', '$reference', NOW())";
    if ($conn->query($sql)) {
        $orderId = $conn->insert_id;
        
        // Insert Items & Update Stock
        foreach ($finalItems as $item) {
            $conn->query("INSERT INTO order_items (order_id, product_id, product_name, price, quantity) 
                          VALUES ($orderId, {$item['id']}, '{$conn->real_escape_string($item['name'])}', {$item['price']}, {$item['qty']})");
            
            $conn->query("UPDATE products SET stock = stock - {$item['qty']} WHERE id={$item['id']}");
        }
        
        echo json_encode(['success' => true, 'orderId' => $orderId, 'reference' => $reference, 'total' => $total]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error DB: ' . $conn->error]);
    }
    exit;
}

// --- PUT: Actualizar Estado (Admin) ---
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Check Admin...
    if (!$user) exit; // ... logic simplified ...
    
    $data = json_decode(file_get_contents('php://input'), true);
    $orderId = (int)($data['id'] ?? 0);
    $status = $conn->real_escape_string($data['status'] ?? '');
    
    if ($orderId && $status) {
        $conn->query("UPDATE orders SET status='$status' WHERE id=$orderId");
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    }
    exit;
}
?>
