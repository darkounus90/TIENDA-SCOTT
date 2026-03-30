<?php
// api/auto_migrate.php - Auto-actualizador de la base de datos
require 'db.php';
header('Content-Type: application/json');

try {
    // Verificar y agregar columnas a 'users'
    $tables = [
        'users' => [
            'google_id' => "VARCHAR(255) NULL UNIQUE AFTER password",
            'profile_photo' => "TEXT NULL AFTER google_id",
            'isAdmin' => "TINYINT(1) DEFAULT 0 AFTER profile_photo",
            'phone' => "VARCHAR(20) NULL AFTER email",
            'department' => "VARCHAR(100) NULL AFTER phone",
            'city' => "VARCHAR(100) NULL AFTER department",
            'address' => "TEXT NULL AFTER city"
        ],
        'orders' => [
            'reference' => "VARCHAR(100) NULL UNIQUE AFTER total",
            'wompi_transaction_id' => "VARCHAR(100) NULL AFTER reference",
            'paid_at' => "DATETIME NULL AFTER created_at"
        ]
    ];

    $log = [];

    foreach ($tables as $table => $columns) {
        foreach ($columns as $column => $definition) {
            $check = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
            if ($check && $check->num_rows == 0) {
                // La columna no existe, agregarla
                $sql = "ALTER TABLE `$table` ADD COLUMN `$column` $definition";
                if ($conn->query($sql)) {
                    $log[] = "Agregada columna $column a $table";
                } else {
                    $log[] = "Error agregando $column a $table: " . $conn->error;
                }
            } else {
                $log[] = "Columna $column ya existe en $table u ocurrió un error verificando.";
            }
        }
    }

    echo json_encode(['success' => true, 'message' => 'Migraciones revisadas y ejecutadas', 'log' => $log]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
