<?php
// orders.php - Gestión de Pedidos
require 'auth_helper.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require 'db.php';

$user = requireAuth(); // Verifica firma del token — reemplaza getUserFromToken()


// --- GET: Listar Pedidos ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'No autorizado']);
        exit;
    }
    
    // Obtener ID real desde DB usando el sub del token
    $userId = (int)($user['sub'] ?? 0);
    $stmt = $conn->prepare("SELECT id, isAdmin FROM users WHERE id=?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $r = $stmt->get_result();
    if (!$r || $r->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Usuario inválido']);
        exit;
    }
    $dbUser = $r->fetch_assoc();
    
    // Si es Admin, listar TODO. Si no, solo suyos.
    $sql = "SELECT o.*, u.username as user_name, u.email as user_email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id ";
            
    $uid = (int)$dbUser['id'];
    if ($dbUser['isAdmin'] != 1) {
        $sql .= " WHERE o.user_id = $uid";
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
    
    // Obtener ID real del usuario por sub del token
    $userId = (int)($user['sub'] ?? 0);
    if (!$userId) {
        echo json_encode(['success' => false, 'message' => 'Token inválido']);
        exit;
    }
    
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
    
    // ---- INICIO TRANSACCIÓN MYSQL ----
    $conn->begin_transaction();
    try {
        $orderId = null;
        $reference = 'ORD-' . time() . '-' . rand(1000, 9999);

        // Insert Order
        $pendingStatus = 'pending';
        $stmt = $conn->prepare("INSERT INTO orders (user_id, total, status, reference, created_at) VALUES (?,?,?,?,NOW())");
        $stmt->bind_param("idss", $userId, $total, $pendingStatus, $reference);
        $stmt->execute();
        $orderId = $conn->insert_id;

        // Insert Items + Stock atómico (previene sobreventa)
        foreach ($finalItems as $item) {
            // Decremento atómico con condición — si stock < qty no actualiza ninguna fila
            $upd = $conn->prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?");
            $upd->bind_param("iii", $item['qty'], $item['id'], $item['qty']);
            $upd->execute();
            if ($upd->affected_rows === 0) {
                throw new Exception("Stock insuficiente para '{$item['name']}' al procesar el pago");
            }

            $ins = $conn->prepare("INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?,?,?,?,?)");
            $ins->bind_param("iisdi", $orderId, $item['id'], $item['name'], $item['price'], $item['qty']);
            $ins->execute();
        }

        $conn->commit();
        echo json_encode(['success' => true, 'orderId' => $orderId, 'reference' => $reference, 'total' => $total]);

    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// --- PUT: Actualizar Estado (Solo Admin) ---
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAdmin(); // Verifica token Y que isAdmin === 1

    $data = json_decode(file_get_contents('php://input'), true);
    $orderId = (int)($data['id'] ?? 0);

    $allowed = ['pending','confirmed','shipped','delivered','cancelled'];
    $status  = $data['status'] ?? '';
    if (!in_array($status, $allowed)) {
        echo json_encode(['success' => false, 'message' => 'Estado inválido']);
        exit;
    }

    if ($orderId) {
        $stmt = $conn->prepare("UPDATE orders SET status=? WHERE id=?");
        $stmt->bind_param("si", $status, $orderId);
        $stmt->execute();
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'ID inválido']);
    }
    exit;
}
?>
