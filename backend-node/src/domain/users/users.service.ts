// src/domain/users/users.service.ts
import { pool } from '../../data-access/db'
import { ApiError } from '../errors'
import { log } from '../../observability/logger'

export async function getUserById(id: number) {
  const [rows] = await pool.execute<any[]>(
    'SELECT id, username, email, phone, department, city, address, profile_photo, isAdmin, created_at FROM users WHERE id = ?',
    [id]
  )
  if (rows.length === 0) throw new ApiError(404, 'Usuario no encontrado')
  return rows[0]
}

export async function updateUserProfile(id: number, data: any) {
  const fields = ['email', 'phone', 'department', 'city', 'address', 'profile_photo']
  const updates: string[] = []
  const values: any[] = []

  fields.forEach(f => {
    if (data[f] !== undefined) {
      updates.push(`${f} = ?`)
      values.push(data[f])
    }
  })

  if (updates.length === 0) throw new ApiError(400, 'Nada que actualizar')

  values.push(id)
  await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)
  log.info({ userId: id }, 'Perfil de usuario actualizado')
}
