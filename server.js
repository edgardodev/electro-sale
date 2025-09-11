const express = require("express");
const app = express();
const port = 3000;

// Para que el backend acepte JSON
app.use(express.json());

// Importar conexión a la base de datos
const db = require("./config/db");

// Rutas de autenticación
const authRoutes = require("./routes/authRoutes");
console.log("✅ authRoutes cargado:", authRoutes); 
app.use("/auth", authRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("¡Servidor funcionando con Express!");
});

// Ruta para ver todos los clientes
app.get("/cliente", (req, res) => {
  db.query("SELECT * FROM cliente", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
