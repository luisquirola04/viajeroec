const Pais = require("../models/pais");
const Provincia = require("../models/provincia");

require("dotenv").config();
const sequelize = require("../config/config");
const { UUIDV4 } = require("sequelize");

class ProvinciaController {
  async getProvinciasActivas(req, res) {
    try {
      const provincias = await Provincia.findAll({
        where: { estado: true },
        include: [
          {
            model: Pais,
            as: 'Pais',
          }
        ]
      });

      return res.status(200).json({
        code: 200,
        provincias,
      });

    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        msj: "Hubo un problema en la consulta"
      });
    }
  }


  async crearProvincia(req, res) {
    const { nombre, info, imagen, externalPais } = req.body;
    if (!nombre || !info || !imagen || !externalPais) {
      return res
        .status(404)
        .json({ msj: "No se enviaron los datos necesarios" });
    }
    const pais = await Pais.findOne({ where: { external: externalPais } });
    console.log
    if (!pais) {
      return res
        .status(404)
        .json({ msj: "No se enviaron los datos necesarios" });
    }
    try {
      await Provincia.create({
        nombre,
        info,
        imagen,
        estado: true,
        paisId: pais.id
      });
      return res.status(200).json({ msj: "Provincia creada correctamente", code: 200 });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msj: "Hubo un error al crear la Provincia" });
    }
  }

  /**

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
      return res.status(200).json({ msj: "Pais creado correctamente", code:200 });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msj: "Hubo un error al crear el pais" });
    }
  }
*/


  async listarProvinciaEc(req, res) {
    const ec = await Pais.findOne({ where: { nombre: "Ecuador" } });
    if (!ec) {
      return res
        .status(404)
        .json({ msj: "No se encontro Ecuador" });
    }
    try {
        const provincias = await Provincia.findAll({
        where: { estado: true, paisId: ec.id },
        include: [
          {
            model: Pais,
            as: 'Pais',
          }
        ]
      });
      
      return res.status(200).json({ provincias:provincias, code: 200 });

    } catch (error) {
      return res
        .status(500)
        .json({ msj: "Hubo un error en la consulta" });
    }
    
  

  }
}

module.exports = new ProvinciaController();
