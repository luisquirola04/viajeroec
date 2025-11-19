const Pais = require("../models/pais");
require("dotenv").config();
const sequelize = require("../config/config");
const { UUIDV4 } = require("sequelize");

class PaisController {
  async getPaisesActivos(req, res) {
    try {
      const paises = await Pais.findAll({ where: { estado: true } });
      console.log("aaaa" + paises);
      return res.status(200).json({
        paises,
      });
    } catch (error) {
      console.log(error.message);

      return res.status(500).json({ msj: "Hubo un problema en la consulta" });
    }
  }

  async crearPais(req, res) {
    try {
      const { nombre, info, imagen } = req.body.data;
      await Pais.create({
        nombre,
        info,
        imagen,
        estado: true,
        
      });
      return res.status(200).json({ msj: "Pais creado correctamente" });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msj: "Hubo un error al crear el pais" });
    }
  }
}

module.exports = PaisController;
