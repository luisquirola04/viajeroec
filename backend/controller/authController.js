'use strict';
const { validationResult } = require('express-validator');
const Cuenta = require('../models/cuenta');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

class AuthController {

async sesion(req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            msg: "Datos faltantes o inválidos",
            code: 400,
            errors: errors.array()
        });
    }

    const { correo, contrasena } = req.body;

    try {
        // 1. Buscar cuenta
        const login = await Cuenta.findOne({
            where: { correo }
        });

        if (!login) {
            return res.status(400).json({
                msg: "CREDENCIALES INVALIDAS",
                code: 400
            });
        }

        // 2. Validar estado
        if (!login.estado) {
            return res.status(403).json({
                msg: "USUARIO NO SE ENCUENTRA ACTIVO",
                code: 403
            });
        }

        // 3. Validar contraseña
        const claveCorrecta = bcrypt.compareSync(contrasena, login.contrasena);
        if (!claveCorrecta) {
            return res.status(400).json({
                msg: "CREDENCIALES INVALIDAS",
                code: 400
            });
        }

        // 4. Rol del usuario
        let rolFinal = login.isAdmin ? "ADMIN" : "USER";

        // 5. Generar token
        const llave = process.env.KEY;

        const tokenData = {
            external: login.external,
            correo: login.correo,
            isAdmin: login.isAdmin,
            role: rolFinal,
            estado: login.estado
        };

        const token = jwt.sign(tokenData, llave, { expiresIn: "2h" });

        return res.status(200).json({
            token,
            msg: `Bienvenid@ ${login.nombre} ${login.apellido}`,
            user: `${login.nombre} ${login.apellido}`,
            correo: login.correo,
            external_cuenta: login.external,
            isAdmin: login.isAdmin,
            estado: login.estado,
            role: rolFinal,
            code: 200
        });

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({
            msg: "Error interno del servidor",
            code: 500,
            error: error.message
        });
    }
}


async registrarAdmin(req, res) {
    try {
        const { nombre, apellido, correo, contrasena } = req.body;

        // 1. Validar datos obligatorios
        if (!nombre || !apellido || !correo || !contrasena) {
            return res.status(400).json({
                msg: "Datos incompletos",
                code: 400
            });
        }

        // 2. Verificar si el correo ya existe
        const existeCorreo = await Cuenta.findOne({
            where: { correo }
        });

        if (existeCorreo) {
            return res.status(400).json({
                msg: "El correo ya se encuentra registrado",
                code: 400
            });
        }

        // 3. Hash de contraseña
        const salt = await bcrypt.genSalt(10);
        const hashContrasena = await bcrypt.hash(contrasena, salt);

        // 4. Crear cuenta ADMIN
        const nuevaCuenta = await Cuenta.create({
            nombre,
            apellido,
            correo,
            contrasena: hashContrasena,
            isAdmin: true,
            estado: true
        });

        // 5. Respuesta
        return res.status(201).json({
            msg: "Administrador creado correctamente",
            external_cuenta: nuevaCuenta.external,
            correo: nuevaCuenta.correo,
            isAdmin: nuevaCuenta.isAdmin,
            code: 201
        });

    } catch (error) {
        console.error("Error al registrar admin:", error);

        // Error de campo único
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                msg: "El correo ya existe",
                code: 400
            });
        }

        return res.status(500).json({
            msg: "Error interno del servidor",
            error: error.message,
            code: 500
        });
    }
}
}

module.exports = new AuthController();