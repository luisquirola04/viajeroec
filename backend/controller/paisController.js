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
    const { nombre, info, imagen } = req.body;
    if (!nombre || !info || !imagen) {
      return res
        .status(404)
        .json({ msj: "No se enviaron los datos necesarios" });
    }
    try {
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

  
  async editarPais(req, res) {
    const { nombre, info, imagen, externalPais } = req.body;
    const pais = await Pais.findOne({where:{external:externalPais}});
    try {
      await pais.update({
        nombre:nombre,
        info:info,
        imagen:imagen,
        estado: true,
      });
      return res.status(200).json({ msj: "Pais creado correctamente" });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msj: "Hubo un error al crear el pais" });
    }
  }
}

module.exports = new PaisController();
