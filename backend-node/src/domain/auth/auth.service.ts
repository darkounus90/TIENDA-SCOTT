// src/domain/auth/auth.service.ts
import bcrypt from 'bcrypt'
import { pool } from '../../data-access/db'
import { signToken } from './jwt'
import { ApiError } from '../errors'
import { log } from '../../observability/logger'
import type { LoginDto, RegisterDto } from './auth.schemas'

export async function register(dto: RegisterDto) {
  const { username, email, password, phone, department, city, address } = dto

  // Verificar si ya existe
  const [existing] = await pool.execute<any[]>(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  )
  if (existing.length > 0) {
    throw new ApiError(409, 'El usuario o correo ya está registrado')
  }

  const hash = await bcrypt.hash(password, 12)

  const [result] = await pool.execute<any>(
    `INSERT INTO users (username, email, password, phone, department, city, address, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [username, email, hash, phone || '', department || '', city || '', address || '']
  )

  log.info({ userId: result.insertId, username }, 'Nuevo usuario registrado')
  return { id: result.insertId, username, email }
}

export async function login(dto: LoginDto) {
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM users WHERE username = ?',
    [dto.username]
  )
  const user = rows[0]

  if (!user || !(await bcrypt.compare(dto.password, user.password))) {
    throw new ApiError(401, 'Credenciales inválidas')
  }

  const token = signToken({
    sub: user.id.toString(),
    username: user.username,
    email: user.email,
    isAdmin: Boolean(user.isAdmin)
  })

  log.info({ userId: user.id }, 'Login exitoso')
  
  // No devolver password
  const { password: _, ...safeUser } = user
  return { user: safeUser, token }
}

export async function googleLogin(googlePayload: any) {
  const { sub: googleId, email, name, picture } = googlePayload

  // 1. Buscar por email o google_id
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  )
  let user = rows[0]

  if (!user) {
    // Registro automático si no existe
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000)
    const [result] = await pool.execute<any>(
      `INSERT INTO users (username, email, google_id, profile_photo, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [username, email, googleId, picture || '']
    )
    const [fresh] = await pool.execute<any[]>('SELECT * FROM users WHERE id = ?', [result.insertId])
    user = fresh[0]
    log.info({ userId: user.id }, 'Usuario registrado vía Google')
  } else if (!user.google_id) {
    // Vincular cuenta existente con Google
    await pool.execute('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id])
    user.google_id = googleId
  }

  const token = signToken({
    sub: user.id.toString(),
    username: user.username,
    email: user.email,
    isAdmin: Boolean(user.isAdmin)
  })

  const { password: _, ...safeUser } = user
  return { user: safeUser, token }
}
