// Configuración de conexión a MySQL para Donweb
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'TU_HOST', // ejemplo: 'mysql.donweb.com'
  user: 'TU_USUARIO',
  password: 'TU_CONTRASEÑA',
  database: 'TU_BASE_DE_DATOS'
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL en Donweb');
});

module.exports = connection;
