const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors()); // para combinar puertos

//  Importar middlewares y rutas
const authMiddleware = require("./middlewares/authMiddleware");

// Rutas 
const authRoutes = require("./routes/authRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const productoRoutes = require("./routes/productoRoutes");

// rutas de pedidos
const pedidoRoutes = require("./routes/pedidoRoutes");
const detallePedidoRoutes = require("./routes/detallePedidoRoutes");

// 🛣️ Usar rutas

// Rutas de autenticación y módulos 
app.use("/auth", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/productos", productoRoutes);

// 🔥 Rutas nuevas protegidas con token
app.use("/api/pedidos", authMiddleware, pedidoRoutes);
app.use("/api/detalle-pedidos", authMiddleware, detallePedidoRoutes);

// Ruta de prueba general
app.get("/", (req, res) => {
  res.send("🚀 Servidor Electro Sale funcionando correctamente");
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${port}`);
});
