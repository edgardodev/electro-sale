 const mysql = require('mysql2');

// Configura la conexión
const connection = mysql.createConnection({
  host: '127.0.0.1',      // o 127.0.0.1
  user: 'root',           // tu usuario MySQL
  password: '',           // tu contraseña MySQL (si la tienes)
  database: 'electrodb'   // tu base de datos
});

// Probar la conexión
connection.connect(err => {
  if (err) {
    console.error('❌ Error conectando a la BD:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

module.exports = connection;