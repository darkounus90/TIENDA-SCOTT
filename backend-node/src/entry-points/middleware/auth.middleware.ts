// src/entry-points/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../../domain/auth/jwt'
import { ApiError } from '../../domain/errors'

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; username: string; email: string; isAdmin: boolean }
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return next(new ApiError(401, 'Token requerido'))
  try {
    const payload = verifyToken(auth.slice(7))
    req.user = { sub: payload.sub, username: payload.username, email: payload.email, isAdmin: payload.isAdmin }
    next()
  } catch (e) {
    next(e)
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  requireAuth(req, _res, (err) => {
    if (err) return next(err)
    if (!req.user?.isAdmin) return next(new ApiError(403, 'Acceso denegado: se requiere rol admin'))
    next()
  })
}
