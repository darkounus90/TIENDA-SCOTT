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

// Aquí puedes agregar nuevas rutas usando MySQL

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});