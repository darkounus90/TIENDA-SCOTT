// src/entry-points/api/products.router.ts
import { Router } from 'express'
import { requireAdmin, requireAuth } from '../middleware/auth.middleware'
import { CreateProductSchema, UpdateProductSchema } from '../../domain/products/products.schemas'
import { getAllProducts, createProduct, deleteProduct, updateProduct } from '../../domain/products/products.service'

const router = Router()

// GET /api/products — Público
router.get('/', async (req, res, next) => {
  try {
    const products = await getAllProducts()
    res.json({ success: true, products })
  } catch (e) {
    next(e)
  }
})

// POST /api/products — Solo Admin
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const parsed = CreateProductSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, issues: parsed.error.issues })
    }

    const { id, ...data } = await createProduct(parsed.data)
    res.status(201).json({ success: true, id, ...data })
  } catch (e) {
    next(e)
  }
})

// DELETE /api/products/:id — Solo Admin
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' })
    await deleteProduct(id)
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

// PUT /api/products/:id — Solo Admin
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(String(req.params.id))
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' })

    const parsed = UpdateProductSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, issues: parsed.error.issues })
    }

    await updateProduct(id, parsed.data)
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

export default router
