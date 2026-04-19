// src/domain/auth/jwt.ts
// Auth con HMAC-SHA256 compatible con el sistema PHP actual
// Permite migración gradual: PHP y Node.js comparten el mismo TOKEN_SECRET
import crypto from 'crypto'
import { ApiError } from '../errors'

export interface TokenPayload {
  sub:      string   // userId
  username: string
  email:    string
  isAdmin:  boolean
  iat:      number
  exp:      number
}

const SECRET = process.env.TOKEN_SECRET
if (!SECRET) throw new Error('TOKEN_SECRET env var is required')
const TTL_SECONDS = 8 * 60 * 60 // 8 horas

function b64url(data: string | Buffer): string {
  const str = typeof data === 'string' ? Buffer.from(data) : data
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function b64decode(str: string): string {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
}

export function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000)
  const full = { ...payload, iat: now, exp: now + TTL_SECONDS }
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body   = b64url(JSON.stringify(full))
  const sig    = b64url(crypto.createHmac('sha256', SECRET!).update(`${header}.${body}`).digest())
  return `${header}.${body}.${sig}`
}

export function verifyToken(token: string): TokenPayload {
  const parts = token.split('.')
  if (parts.length !== 3) throw new ApiError(401, 'Token inválido')

  const [header, body, sig] = parts
  const expected = b64url(crypto.createHmac('sha256', SECRET!).update(`${header}.${body}`).digest())

  // Comparación de tiempo constante
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw new ApiError(401, 'Token inválido')
  }

  const payload = JSON.parse(b64decode(body)) as TokenPayload
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new ApiError(401, 'Token expirado')
  }

  return payload
}
