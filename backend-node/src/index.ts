// src/index.ts — Entry point del servidor
import 'dotenv/config'
import app from './app'
import { log } from './observability/logger'

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  log.info(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  log.info(`   Entorno: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown — importante para VPS/PM2
process.on('SIGTERM', () => {
  log.info('SIGTERM recibido — cerrando servidor...')
  server.close(() => {
    log.info('Servidor cerrado correctamente')
    process.exit(0)
  })
})

process.on('uncaughtException', (err) => {
  log.error({ err }, 'Uncaught exception — cerrando proceso')
  process.exit(1)
})
