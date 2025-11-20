const express = require("express");
const cors = require("cors");
const path = require("path");

// 🔌 Rutas
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productoRoutes = require("./routes/productoRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");

const app = express();

// ---------- MIDDLEWARES GLOBALES ----------
app.use(cors());
app.use(express.json());

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// ---------- RUTAS DE API ----------

// Auth (registro, login, perfil)
app.use("/auth", authRoutes);

// Dashboard admin
app.use("/api/dashboard", dashboardRoutes);

// CRUD de productos
app.use("/api/productos", productoRoutes);

// CRUD de pedidos
app.use("/api/pedidos", pedidoRoutes);


// ---------- ARRANCAR SERVIDOR ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://127.0.0.1:${PORT}`);
});
