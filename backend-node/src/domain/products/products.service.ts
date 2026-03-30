// src/domain/products/products.service.ts
import { pool } from '../../data-access/db'
import { ApiError } from '../errors'
import { log } from '../../observability/logger'
import type { CreateProductDto, UpdateProductDto } from './products.schemas'

export async function getAllProducts() {
  const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC')
  return rows
}

export async function createProduct(dto: CreateProductDto) {
  const { name, description, price, stock, category, image } = dto
  const [result] = await pool.execute<any>(
    'INSERT INTO products (name, description, price, stock, category, image, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [name, description || '', price, stock, category || '', image || '']
  )
  log.info({ productId: result.insertId, name }, 'Producto creado exitosamente')
  return { id: result.insertId, ...dto }
}

export async function deleteProduct(id: number) {
  const [res] = await pool.execute<any>('DELETE FROM products WHERE id = ?', [id])
  if (res.affectedRows === 0) throw new ApiError(404, 'Producto no encontrado')
  log.info({ productId: id }, 'Producto eliminado')
}

export async function updateProduct(id: number, dto: UpdateProductDto) {
  const updates: string[] = []
  const values: any[] = []

  Object.entries(dto).forEach(([key, val]) => {
    if (val !== undefined) {
      updates.push(`${key} = ?`)
      values.push(val)
    }
  })

  if (updates.length > 0) {
    values.push(id)
    const [res] = await pool.execute<any>(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    )
    if (res.affectedRows === 0) throw new ApiError(404, 'Producto no encontrado')
    log.info({ productId: id }, 'Producto actualizado')
  }
}
