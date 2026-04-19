// src/entry-points/api/orders.router.ts
import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.middleware'
import { CreateOrderSchema } from '../../domain/orders/orders.schemas'
import { createOrder, updateOrderStatus } from '../../domain/orders/orders.service'
import { pool } from '../../data-access/db'

const router = Router()

// GET /api/orders — listar pedidos del usuario (o todos si es admin)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = parseInt(req.user!.sub)
    const isAdmin = req.user!.isAdmin

    let sql = `SELECT o.*, u.username as user_name, u.email as user_email
               FROM orders o LEFT JOIN users u ON o.user_id = u.id`
    const params: number[] = []

    if (!isAdmin) {
      sql += ' WHERE o.user_id = ?'
      params.push(userId)
    }
    sql += ' ORDER BY o.created_at DESC'

    const [orders] = await pool.execute<any[]>(sql, params)

    // Fetch items por orden
    for (const order of orders) {
      const [items] = await pool.execute<any[]>(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      )
      order.items = items
    }

    res.json({ success: true, orders, isAdmin })
  } catch (e) { next(e) }
})

// POST /api/orders — crear nuevo pedido
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const parsed = CreateOrderSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, issues: parsed.error.issues })
    }

    const userId = parseInt(req.user!.sub)
    const result = await createOrder(userId, parsed.data.items)
    res.status(201).json({ success: true, ...result })
  } catch (e) { next(e) }
})

// PUT /api/orders — actualizar estado (solo admin)
router.put('/', requireAdmin, async (req, res, next) => {
  try {
    const { id, status } = req.body
    if (!id || !status) return res.status(400).json({ success: false, message: 'id y status requeridos' })
    await updateOrderStatus(parseInt(id), status)
    res.json({ success: true })
  } catch (e) { next(e) }
})

export default router
