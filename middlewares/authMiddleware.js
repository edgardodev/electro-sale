 const jwt = require("jsonwebtoken");
const JWT_SECRET = "mi_secreto_super_seguro"; 

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1]; 

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido o expirado" });
    }

    req.user = user; 
    next();
  });
}

module.exports = authMiddleware;
