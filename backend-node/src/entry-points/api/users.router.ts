// src/entry-points/api/users.router.ts
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { getUserById, updateUserProfile } from '../../domain/users/users.service'

const router = Router()

// GET /api/users/me — Obtener perfil propio
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.user!.sub)
    const user = await getUserById(id)
    res.json({ success: true, user })
  } catch (e) {
    next(e)
  }
})

// PUT /api/users/me — Actualizar perfil propio
router.put('/me', requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.user!.sub)
    await updateUserProfile(id, req.body)
    res.json({ success: true, message: 'Perfil actualizado' })
  } catch (e) {
    next(e)
  }
})

export default router
