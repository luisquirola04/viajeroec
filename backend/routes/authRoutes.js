const router = require('express').Router();
const loginController = require('../controller/authController'); 
const { body } = require('express-validator');
const auth = require("../middleware/AuthAdmin");


router.post(
    '/login',
    [
        body('correo', 'Ingrese un correo').trim().exists().notEmpty(),
        body('contrasena', 'Ingrese una clave').trim().exists().notEmpty(),
    ],
    loginController.sesion
);

// -------------------------
// Registrar admin
// -------------------------
router.post(
    '/crear',
    [
        body('nombre', 'Ingrese un nombre').trim().exists().notEmpty(),
        body('apellido', 'Ingrese un apellido').trim().exists().notEmpty(),
        body('correo', 'Ingrese un correo').trim().exists().notEmpty(),
        body('contrasena', 'Ingrese una contraseña').trim().exists().notEmpty(),
    ],
    loginController.registrarAdmin
);

router.get('/validar', auth, (req, res) => {
    res.status(200).json({ 
        msg: "Token válido", 
        code: 200, 
        data: req.user 
    });
});

module.exports = router;