<?php
// google_login.php - Login/registro con Google
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// DEBUG LOGGING
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/google_login_error.log');
error_reporting(E_ALL);

try {
    require 'db.php';

    $input = file_get_contents('php://input');
    // error_log("Input received: " . $input); // Uncomment for full debug

    $data = json_decode($input, true);
    $credential = $data['credential'] ?? '';

    if (!$credential) {
        throw new Exception("Token de Google requerido");
    }

    // Decodificar el JWT de Google (sin librería externa)
    $parts = explode('.', $credential);
    if (count($parts) !== 3) {
        throw new Exception("Token inválido");
    }

    $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);

    if (!$payload || !isset($payload['email']) || !isset($payload['sub'])) {
        throw new Exception("No se pudo decodificar el token de Google");
    }

    // Verificar que el token no esté expirado
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        throw new Exception("Token de Google expirado");
    }

    $google_id = $payload['sub'];
    $email = $payload['email'];
    $name = $payload['name'] ?? $payload['given_name'] ?? explode('@', $email)[0];
    $picture = $payload['picture'] ?? '';

    // Buscar si el usuario ya existe por email o google_id
    // IMPORTANTE: Checking if phone column exists would be safer, but for now assuming schema matches
    $stmt = $conn->prepare("SELECT id, username, email, phone, isAdmin, google_id, profile_photo FROM users WHERE email=? OR google_id=?");
    if (!$stmt) {
        throw new Exception("Error preparando consulta: " . $conn->error);
    }
    
    $stmt->bind_param("ss", $email, $google_id);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows > 0) {
        // Usuario existente
        $user = $res->fetch_assoc();
        
        $updates = [];
        $types = "";
        $params = [];

        if (empty($user['google_id'])) {
            $updates[] = "google_id=?";
            $types .= "s";
            $params[] = $google_id;
        }
        
        if (empty($user['profile_photo']) && !empty($picture)) {
            $updates[] = "profile_photo=?";
            $types .= "s";
            $params[] = $picture;
            $user['profile_photo'] = $picture;
        }

        if (!empty($updates)) {
            $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id=?";
            $types .= "i";
            $params[] = $user['id'];
            
            $updateStmt = $conn->prepare($sql);
            if (!$updateStmt) {
                throw new Exception("Error preparando actualización: " . $conn->error);
            }
            $updateStmt->bind_param($types, ...$params);
            $updateStmt->execute();
        }
        
        unset($user['google_id']);
        $user['isAdmin'] = (int)$user['isAdmin'];
        
    } else {
        // Nuevo usuario
        $username = preg_replace('/[^a-zA-Z0-9]/', '', $name);
        
        $checkStmt = $conn->prepare("SELECT id FROM users WHERE username=?");
        if (!$checkStmt) {
            throw new Exception("Error preparando verificación de usuario: " . $conn->error);
        }
        $checkStmt->bind_param("s", $username);
        $checkStmt->execute();
        if ($checkStmt->get_result()->num_rows > 0) {
            $username = $username . '_' . substr($google_id, -4);
        }
        
        $randomPass = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
        
        // Use COALESCE logic or carefully check schema. Assuming profile_photo exists.
        $insertStmt = $conn->prepare("INSERT INTO users (username, email, password, google_id, profile_photo, isAdmin) VALUES (?, ?, ?, ?, ?, 0)");
        if (!$insertStmt) {
             throw new Exception("Error preparando insert: " . $conn->error);
        }

        $insertStmt->bind_param("sssss", $username, $email, $randomPass, $google_id, $picture);
        
        if (!$insertStmt->execute()) {
             throw new Exception("Error al registrar usuario: " . $insertStmt->error);
        }
        
        $user = [
            'id' => $conn->insert_id,
            'username' => $username,
            'email' => $email,
            'phone' => '',
            'profile_photo' => $picture,
            'isAdmin' => 0
        ];
    }

    $tokenPayload = base64_encode(json_encode([
        'username' => $user['username'],
        'email' => $user['email'],
        'phone' => $user['phone'] ?? '',
        'isAdmin' => $user['isAdmin'],
        'iat' => time()
    ]));
    $token = $tokenPayload . '.' . md5($tokenPayload . 'SALT');

    echo json_encode([
        "success" => true,
        "message" => "Login con Google exitoso",
        "user" => $user,
        "token" => $token
    ]);

} catch (Exception $e) {
    error_log("Google Login Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
