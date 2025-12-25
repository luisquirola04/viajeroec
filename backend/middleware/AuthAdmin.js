// middleware/authAdmin.js
const jwt = require("jsonwebtoken");
const Cuenta = require("../models/cuenta");
const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers["x-access-token"];
    if (!authHeader) {
      return res.status(401).json({ msg: "No autorizado: falta token" });
    }
    const token = authHeader;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.KEY);
    } catch (err) {
      console.error("Error verificando token:", err.message);
      return res.status(401).json({ msg: "Token inválido o expirado" });
    }
    const cuenta = await Cuenta.findOne({
      where: { external: decoded.external },
    });
    if (!cuenta) {
      return res.status(401).json({ msg: "Usuario no encontrado" });
    }
    if (!cuenta.isAdmin || cuenta.isAdmin !== true) {
      return res.json({
        msg: "Acceso prohibido: solo administradores",
        code: 401,
      });
    }
    req.user = {
      id: cuenta.id,
      nombre: `${cuenta.persona?.nombre || ""} ${
        cuenta.persona?.apellido || ""
      }`,
      correo: cuenta.correo,
      external: cuenta.external,
    };
    next();
  } catch (error) {
    console.error("Error en authAdmin:", error.message);
    return res.status(500).json({ msg: "Error interno en autorización" });
  }
};

module.exports = authAdmin;
