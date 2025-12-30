const Pais = require("../models/pais");
const Provincia = require("../models/provincia");
const Canton = require("../models/canton");

require("dotenv").config();
const sequelize = require("../config/config");
const { UUIDV4 } = require("sequelize");

class CantonController {
  async getCantonesActivos(req, res) {
    try {
      const cantones = await Canton.findAll({
      where: { estado: true },
      include: [
        {
          model: Provincia,
          as: "Provincia",
          include: [
            {
              model: Pais,
              as: "Pais",
            },
          ],
        },
      ],
    });

      return res.status(200).json({
        code: 200,
        cantones,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        msj: "Hubo un problema en la consulta",
      });
    }
  }

  async crearCanton(req, res) {
    const { nombre, info, imagen, externalProvincia } = req.body;
    if (!nombre || !info  || !externalProvincia) {
      return res
        .status(404)
        .json({ msj: "No se enviaron los datos necesarios" });
    }
    const provincia = await Provincia.findOne({
      where: { external: externalProvincia },
    });
    console.log;
    if (!provincia) {
      return res
        .status(404)
        .json({ msj: "No se enviaron los datos necesarios" });
    }
    try {
      await Canton.create({
        nombre,
        info,
        estado: true,
        provinciaId: provincia.id,
      });
      return res
        .status(200)
        .json({ msj: "Canton creada correctamente", code: 200 });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msj: "Hubo un error al crear el canton" });
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
}

module.exports = new CantonController();
