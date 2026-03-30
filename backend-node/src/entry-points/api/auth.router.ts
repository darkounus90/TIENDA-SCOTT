// src/entry-points/api/auth.router.ts
import { Router } from 'express'
import { LoginSchema, RegisterSchema } from '../../domain/auth/auth.schemas'
import { login, register, googleLogin } from '../../domain/auth/auth.service'
import { ApiError } from '../../domain/errors'
import { log } from '../../observability/logger'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, issues: parsed.error.issues })
    }

    const user = await register(parsed.data)
    res.status(201).json({ success: true, user })
  } catch (e) {
    next(e)
  }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const parsed = LoginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, issues: parsed.error.issues })
    }

    const { user, token } = await login(parsed.data)
    res.json({ success: true, user, token })
  } catch (e) {
    next(e)
  }
})

// POST /api/auth/google — maneja el login de Google decodificado
router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body
    if (!credential) throw new ApiError(400, 'Credencial de Google requerida')

    // Verificación real con Google (se asume que el tokeninfo se hace en el service o por fetch)
    // Para simplificar, aquí usaremos la lógica real de verify contra Google API
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    const response = await fetch(verifyUrl)
    const payload = (await response.json()) as { error?: string; aud?: string; [key: string]: any }

    if (!payload || payload.error) throw new ApiError(401, 'Token de Google inválido')

    // Validar client ID
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new ApiError(401, 'Token no emitido para esta aplicación')
    }

    const data = await googleLogin(payload)
    res.json({ success: true, ...data })
  } catch (e) {
    next(e)
  }
})

export default router
