-- database_update.sql
-- Ejecuta esto en tu phpMyAdmin para asegurar compatibilidad total con el nuevo sistema

-- 1. Asegurar tabla de usuarios con campos para Google y Admin
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE AFTER password,
ADD COLUMN IF NOT EXISTS profile_photo TEXT AFTER google_id,
ADD COLUMN IF NOT EXISTS isAdmin TINYINT(1) DEFAULT 0 AFTER profile_photo,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER email,
ADD COLUMN IF NOT EXISTS department VARCHAR(100) AFTER phone,
ADD COLUMN IF NOT EXISTS city VARCHAR(100) AFTER department,
ADD COLUMN IF NOT EXISTS address TEXT AFTER city;

-- 2. Asegurar que las órdenes tengan campos para Wompi
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS reference VARCHAR(100) UNIQUE AFTER total,
ADD COLUMN IF NOT EXISTS wompi_transaction_id VARCHAR(100) AFTER reference,
ADD COLUMN IF NOT EXISTS paid_at DATETIME AFTER created_at;

-- 3. Índices para performance (importante para escalar a muchos pedidos)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
