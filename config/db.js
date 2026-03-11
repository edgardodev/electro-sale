const mysql = require("mysql2");

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect(err => {
  if (err) {
    console.error("Error conectando a la BD:", err);
    return;
  }
  console.log("✅ Conectado a MySQL");
});

module.exports = connection;