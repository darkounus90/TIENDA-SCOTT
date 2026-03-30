// src/entry-points/api/webhooks.router.ts
// Webhook de Wompi — receptor de notificaciones de pago
import { Router } from 'express'
import crypto from 'crypto'
import { pool } from '../../data-access/db'
import { log } from '../../observability/logger'

const router = Router()

// POST /api/webhooks/wompi
// IMPORTANTE: usar express.raw() para obtener body sin parsear (necesario para verificar firma)
router.post('/wompi', async (req, res) => {
  const signature = req.headers['x-wompi-signature-v1'] as string
  const timestamp = req.headers['x-wompi-timestamp'] as string
  const rawBody = req.body as Buffer  // express.raw() en app.ts

  const secret = process.env.WOMPI_WEBHOOK_SECRET
  if (!secret) {
    log.error('WOMPI_WEBHOOK_SECRET no configurado')
    return res.status(500).json({ error: 'Webhook no configurado' })
  }

  if (!signature || !timestamp) {
    log.warn('Webhook sin headers de firma')
    return res.status(401).json({ error: 'Firma requerida' })
  }

  // --- VERIFICACIÓN HMAC-SHA256 ---
  const expected = crypto.createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')

  // timingSafeEqual previene timing attacks
  const sigBuf = Buffer.from(signature.toLowerCase())
  const expBuf = Buffer.from(expected.toLowerCase())

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    log.warn({ signature }, 'Webhook Wompi con firma INVÁLIDA — posible ataque')
    return res.status(401).json({ error: 'Firma inválida' })
  }

  // --- PROCESAR EVENTO ---
  try {
    const event = JSON.parse(rawBody.toString())

    if (event.event === 'transaction.updated') {
      const tx     = event.data?.transaction
      const status = tx?.status
      const ref    = tx?.reference

      if (!tx || !ref) return res.status(400).json({ error: 'Payload incompleto' })

      const [rows] = await pool.execute<any[]>(
        'SELECT id, status FROM orders WHERE reference = ?',
        [ref]
      )
      const order = rows[0]

      if (!order) {
        log.warn({ ref }, 'Referencia Wompi no encontrada en DB')
        return res.status(200).json({ received: true, note: 'referencia no encontrada' })
      }

      // --- IDEMPOTENCIA: No procesar dos veces ---
      if (order.status === 'paid') {
        log.info({ ref }, 'Orden ya pagada — ignorando webhook duplicado')
        return res.status(200).json({ received: true, note: 'ya procesado' })
      }

      const statusMap: Record<string, string> = {
        'APPROVED' : 'paid',
        'DECLINED' : 'payment_declined',
        'VOIDED'   : 'cancelled',
        'ERROR'    : 'payment_error',
      }

      const newStatus = statusMap[status]
      if (newStatus) {
        await pool.execute(
          'UPDATE orders SET status = ?, wompi_transaction_id = ?, paid_at = NOW() WHERE id = ?',
          [newStatus, tx.id, order.id]
        )
        log.info({ orderId: order.id, newStatus, txId: tx.id }, 'Orden actualizada por Wompi')
      }
    }

    // Siempre 200 — Wompi reintenta si no recibe 200
    res.status(200).json({ received: true })
  } catch (err) {
    log.error({ err }, 'Error procesando webhook Wompi')
    res.status(200).json({ received: true }) // 200 para evitar reintentos infinitos
  }
})

export default router
