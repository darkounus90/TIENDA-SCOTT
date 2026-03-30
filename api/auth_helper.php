<?php
// api/auth_helper.php
// Funciones centralizadas de autenticación
// Reemplaza el sistema de tokens falso con HMAC-SHA256

define('TOKEN_SECRET', getenv('TOKEN_SECRET') ?: 'CAMBIA_ESTO_EN_ENV_ANTES_DE_PRODUCCION');
define('TOKEN_TTL', 60 * 60 * 8); // 8 horas
define('ALLOWED_ORIGIN', getenv('ALLOWED_ORIGIN') ?: '*');

/**
 * Emite los headers CORS correctos.
 * En producción, ALLOWED_ORIGIN debe ser tu dominio real.
 */
function setCorsHeaders() {
    $origin = ALLOWED_ORIGIN;
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Content-Type: application/json; charset=UTF-8");
}

/**
 * Genera un token seguro firmado con HMAC-SHA256.
 * Reemplaza el md5 + SALT anterior.
 */
function generateToken(array $payload): string {
    $payload['iat'] = time();
    $payload['exp'] = time() + TOKEN_TTL;
    $header = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $body   = base64url_encode(json_encode($payload));
    $sig    = base64url_encode(hash_hmac('sha256', "$header.$body", TOKEN_SECRET, true));
    return "$header.$body.$sig";
}

/**
 * Verifica y decodifica un token.
 * Retorna el payload si es válido, o null si no lo es.
 */
function verifyToken(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $body, $sig] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', "$header.$body", TOKEN_SECRET, true));

    // Comparación de tiempo constante — previene timing attacks
    if (!hash_equals($expected, $sig)) return null;

    $payload = json_decode(base64url_decode($body), true);
    if (!$payload) return null;

    // Verificar expiración
    if (isset($payload['exp']) && $payload['exp'] < time()) return null;

    return $payload;
}

/**
 * Extrae y verifica el token del header Authorization.
 * Retorna el payload o responde 401 y termina.
 */
function requireAuth(): array {
    $auth = getAuthHeaderRaw();
    if (!$auth || !preg_match('/Bearer\s+(.+)$/i', $auth, $m)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token requerido']);
        exit;
    }
    $payload = verifyToken($m[1]);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token inválido o expirado']);
        exit;
    }
    return $payload;
}

/**
 * Igual que requireAuth pero además exige que isAdmin === 1.
 */
function requireAdmin(): array {
    $payload = requireAuth();
    if (empty($payload['isAdmin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Acceso denegado: se requiere rol admin']);
        exit;
    }
    return $payload;
}

// --- Helpers internos ---

function getAuthHeaderRaw(): ?string {
    if (function_exists('apache_request_headers')) {
        $h = apache_request_headers();
        if (!empty($h['Authorization'])) return $h['Authorization'];
        if (!empty($h['authorization'])) return $h['authorization'];
    }
    if (!empty($_SERVER['HTTP_AUTHORIZATION']))          return $_SERVER['HTTP_AUTHORIZATION'];
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    return null;
}

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}
