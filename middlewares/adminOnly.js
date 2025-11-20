module.exports = (req, res, next) => {
  // Si no hay usuario en la request, no está autenticado
  if (!req.user) {
    return res.status(401).json({ mensaje: "No autenticado" });
  }

  // Solo permitimos rol admin
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ mensaje: "Acceso solo para administradores" });
  }

  next();
};
