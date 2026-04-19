// Configuración de conexión a MySQL para Donweb
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '200.58.111.97',
  user: 'c2721903_scott',
  password: 'danida50PE',
  database: 'c2721903_scott'
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL en Donweb');
});

module.exports = connection;
