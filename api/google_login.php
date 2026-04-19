<?php
// google_login.php - Login/registro con Google
require 'auth_helper.php';
setCorsHeaders();

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

    // --- VERIFICACIÓN REAL DEL TOKEN DE GOOGLE ---
    // Llama a la API de Google para validar el token (no solo decodifica)
    $clientId = getenv('GOOGLE_CLIENT_ID');
    $verifyUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential);
    $ch = curl_init($verifyUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || !$response) {
        throw new Exception("Token de Google inválido o expirado");
    }

    $payload = json_decode($response, true);

    // Verificar que el token fue emitido para NUESTRA app
    if (!$clientId || ($payload['aud'] ?? '') !== $clientId) {
        throw new Exception("Token no pertenece a esta aplicación");
    }

    if (!isset($payload['email']) || !isset($payload['sub'])) {
        throw new Exception("Token de Google no contiene datos requeridos");
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

    // Token seguro con HMAC-SHA256
    $token = generateToken([
        'sub'     => (string)$user['id'],
        'username'=> $user['username'],
        'email'   => $user['email'],
        'isAdmin' => (int)($user['isAdmin'] ?? 0),
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Login con Google exitoso",
        "user"    => $user,
        "token"   => $token
    ]);

} catch (Exception $e) {
    error_log("Google Login Error: " . $e->getMessage());
    http_response_code(401);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
