// src/app.ts — Express app setup (sin listen, para tests y modularidad)
import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { ApiError } from './domain/errors'
import { log } from './observability/logger'
import authRouter     from './entry-points/api/auth.router'
import productsRouter from './entry-points/api/products.router'
import usersRouter     from './entry-points/api/users.router'
import ordersRouter   from './entry-points/api/orders.router'
import webhooksRouter from './entry-points/api/webhooks.router'

const app = express()

// --- SEGURIDAD: Headers HTTP ---
app.use(helmet())

// --- CORS ---
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*'
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (_req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

// --- RATE LIMITING ---
app.use('/api/auth', rateLimit({
  windowMs: 60_000,
  max: 20,
  message: { error: 'Demasiados intentos. Intenta en 1 minuto.' }
}))
app.use('/api', rateLimit({ windowMs: 60_000, max: 200 }))

// --- WEBHOOKS: raw body ANTES del json parser ---
app.use('/api/webhooks', express.raw({ type: 'application/json' }))

// --- BODY PARSERS ---
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// --- LOGGING DE REQUESTS ---
app.use((req, _res, next) => {
  log.info({ method: req.method, path: req.path }, 'HTTP request')
  next()
})

// --- ROUTERS ---
app.use('/api/auth',     authRouter)
app.use('/api/products', productsRouter)
app.use('/api/users',    usersRouter)
app.use('/api/orders',   ordersRouter)
app.use('/api/webhooks', webhooksRouter)

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// --- MANEJO DE ERRORES ---
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, error: err.message })
  }
  log.error({ err }, 'Unhandled error')
  // NUNCA exponer stack traces en producción
  res.status(500).json({ success: false, error: 'Error interno del servidor' })
})

export default app
