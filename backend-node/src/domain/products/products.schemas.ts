// src/domain/products/products.schemas.ts
import { z } from 'zod'

export const CreateProductSchema = z.object({
  name:        z.string().min(1, 'Nombre requerido').max(200),
  description: z.string().optional(),
  price:       z.number().min(0, 'Precio debe ser positivo'),
  stock:       z.number().int().min(0, 'Stock debe ser un entero positivo'),
  category:    z.string().optional(),
  image:       z.string().optional(), // Base64 o URL
})

export const UpdateProductSchema = CreateProductSchema.partial()

export type CreateProductDto = z.infer<typeof CreateProductSchema>
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>
