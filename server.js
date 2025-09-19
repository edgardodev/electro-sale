 const express = require("express");
const cors = require("cors");   // 👈 importar cors
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());  // 👈 habilitar CORS para permitir peticiones desde 127.0.0.1:5500

// Importar conexión a la base de datos (importante que se use dentro de los controladores)
const db = require("./config/db");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const clienteRoutes = require("./routes/clienteRoutes");

// Usar rutas
app.use("/auth", authRoutes);       
app.use("/clientes", clienteRoutes); 

// Ruta de prueba general
app.get("/", (req, res) => {
  res.send("¡Servidor funcionando con Express! 🚀");
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
