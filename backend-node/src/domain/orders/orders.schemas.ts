// src/domain/orders/orders.schemas.ts
import { z } from 'zod'

export const CartItemSchema = z.object({
  id:  z.number().int().positive(),
  qty: z.number().int().min(1).max(100),
})

export const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'Carrito vacío'),
})

export type CartItem = z.infer<typeof CartItemSchema>
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>
