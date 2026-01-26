// Ruta para cambiar el rol de un usuario (cliente/admin)
// Ejemplo de uso: PUT /api/users/3/role con body { "isAdmin": 1 }
app.put('/api/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;
  if (typeof isAdmin === 'undefined') {
    return res.status(400).json({ message: 'isAdmin requerido (0 o 1)' });
  }
  connection.query('UPDATE users SET isAdmin = ? WHERE id = ?', [isAdmin, id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Rol actualizado correctamente' });
  });
});
// Middleware para verificar token y admin
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'tu_secreto_jwt_produccion'; // Usa el mismo secreto que en login
function verifyAdmin(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ message: 'Token requerido' });
  const token = auth.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ message: 'Solo administradores' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

// Ruta para listar usuarios (solo admin)
app.get('/api/users', verifyAdmin, (req, res) => {
  connection.query('SELECT id, username, email, isAdmin FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});
// ...existing code...

const express = require('express');
const cors = require('cors');
const fileupload = require('express-fileupload');
const connection = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileupload());
app.use(express.static('.'));

// Ruta para probar la conexión a MySQL
app.get('/test-mysql', (req, res) => {
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ tablas: results });
  });
});


// Ruta para registrar usuarios (con email y verificación de formato)
const bcrypt = require('bcryptjs');
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Usuario, correo y contraseña requeridos' });
  }
  // Verificar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Correo electrónico inválido' });
  }
  try {
    // Verificar si el usuario o correo ya existen
    connection.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length > 0) return res.status(400).json({ message: 'El usuario o correo ya existen' });
      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      // Insertar usuario como cliente (isAdmin = 0)
      connection.query('INSERT INTO users (username, email, password, isAdmin) VALUES (?, ?, ?, 0)', [username, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(201).json({ message: 'Usuario registrado correctamente' });
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});