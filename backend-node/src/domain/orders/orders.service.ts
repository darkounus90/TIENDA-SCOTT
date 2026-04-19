// src/domain/orders/orders.service.ts
// Lógica de pedidos con transacciones atómicas y stock seguro
import { pool } from '../../data-access/db'
import type { CartItem } from './orders.schemas'
import { ApiError } from '../errors'
import { log } from '../../observability/logger'

export async function createOrder(userId: number, items: CartItem[]) {
  const conn = await pool.getConnection()
  await conn.beginTransaction()

  try {
    let total = 0
    const finalItems: Array<{ id: number; name: string; price: number; qty: number }> = []

    // Validar stock y calcular total DENTRO de la transacción
    for (const item of items) {
      const [rows] = await conn.execute<any[]>(
        'SELECT id, name, price, stock FROM products WHERE id = ?',
        [item.id]
      )
      const product = rows[0]
      if (!product) throw new ApiError(404, `Producto #${item.id} no encontrado`)

      // Decremento atómico — si stock < qty, affected_rows === 0 → sobreventa prevenida
      const [upd] = await conn.execute<any>(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [item.qty, item.id, item.qty]
      )
      if (upd.affectedRows === 0) {
        throw new ApiError(409, `Stock insuficiente para "${product.name}"`)
      }

      total += product.price * item.qty
      finalItems.push({ id: item.id, name: product.name, price: product.price, qty: item.qty })
    }

    // Generar referencia única para Wompi
    const reference = `ORD-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`

    // Insertar orden
    const [orderResult] = await conn.execute<any>(
      'INSERT INTO orders (user_id, total, status, reference, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, total, 'pending', reference]
    )
    const orderId = orderResult.insertId

    // Insertar items
    for (const item of finalItems) {
      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.name, item.price, item.qty]
      )
    }

    await conn.commit()
    log.info({ orderId, userId, total, reference }, 'Orden creada exitosamente')
    return { orderId, reference, total }

  } catch (err) {
    await conn.rollback()
    log.error({ err, userId }, 'Error al crear orden — rollback ejecutado')
    throw err
  } finally {
    conn.release()
  }
}

export async function updateOrderStatus(orderId: number, status: string) {
  const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'paid', 'payment_declined']
  if (!allowed.includes(status)) throw new ApiError(400, 'Estado inválido')

  await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId])
  log.info({ orderId, status }, 'Estado de orden actualizado')
}
