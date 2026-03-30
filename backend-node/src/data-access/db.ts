// src/data-access/db.ts
// Conexión a MySQL usando mysql2 (compatible con Ferozo)
// Migración futura a Drizzle ORM cuando sea necesario

import mysql from 'mysql2/promise'
import { log } from '../observability/logger'

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || '',
  password: process.env.DB_PASS     || '',
  database: process.env.DB_NAME     || '',
  waitForConnections: true,
  connectionLimit: 10,       // Ferozo compartido tiene límite ~25 — no superar
  queueLimit: 0,
  charset: 'utf8mb4',
})

// Verificar conexión al iniciar
pool.getConnection()
  .then(conn => {
    log.info('✅ MySQL connected')
    conn.release()
  })
  .catch(err => {
    log.error({ err }, '❌ MySQL connection failed')
    process.exit(1)
  })

export { pool }
