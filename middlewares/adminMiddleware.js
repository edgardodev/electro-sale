// middlewares/adminMiddleware.js
module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ mensaje: "Acceso restringido solo a administradores" });
  }
  next();
};
