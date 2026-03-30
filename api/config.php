<?php
// api/config.php — NUNCA commitear este archivo con credenciales reales
// Usar variables de entorno en producción (cPanel de Ferozo > Variables de entorno)
return [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'user' => getenv('DB_USER') ?: 'c2721903_scott',   // cambiar a getenv() en producción
    'pass' => getenv('DB_PASS') ?: '',                  // MOVER A .env — NO dejar contraseña aquí
    'db'   => getenv('DB_NAME') ?: 'c2721903_scott',
];
