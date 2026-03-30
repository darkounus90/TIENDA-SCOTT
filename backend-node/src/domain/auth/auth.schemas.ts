// src/domain/auth/auth.schemas.ts
import { z } from 'zod'

export const LoginSchema = z.object({
  username: z.string().min(1, 'Usuario requerido').max(100),
  password: z.string().min(1, 'Contraseña requerida').max(200),
})

export const RegisterSchema = z.object({
  username:   z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  email:      z.string().email('Correo inválido').max(254),
  password:   z.string().min(8, 'Mínimo 8 caracteres').max(200),
  phone:      z.string().max(20).optional(),
  department: z.string().max(100).optional(),
  city:       z.string().max(100).optional(),
  address:    z.string().max(255).optional(),
})

export type LoginDto    = z.infer<typeof LoginSchema>
export type RegisterDto = z.infer<typeof RegisterSchema>
