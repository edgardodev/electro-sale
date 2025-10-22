const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// ✅ Permitir conexión desde tu frontend (Live Server)
app.use(cors({
  origin: "http://127.0.0.1:5500",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Importar middlewares y rutas
const authMiddleware = require("./middlewares/authMiddleware");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const productoRoutes = require("./routes/productoRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const detallePedidoRoutes = require("./routes/detallePedidoRoutes");

// Usar rutas
app.use("/auth", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", authMiddleware, pedidoRoutes);
app.use("/api/detalle-pedidos", authMiddleware, detallePedidoRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Servidor Electro Sale funcionando correctamente");
});

// Iniciar servidor
app.listen(port, "127.0.0.1", () => {
  console.log(`✅ Servidor corriendo en: http://127.0.0.1:${port}`);
});
