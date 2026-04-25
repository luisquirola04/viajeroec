const Pais = require("../models/pais");
const Provincia = require("../models/provincia");
const Canton = require("../models/canton");
const Parroquia = require("../models/parroquia");

require("dotenv").config();
const sequelize = require("../config/config");
const { UUIDV4, ENUM } = require("sequelize");

class ParroquiaController {

  async getParroquiasActivas(req, res) {
    try {
      const parroquias = await Parroquia.findAll({
        where: { estado: true },
        include: [
          {
            model: Canton,
            as: "Canton",
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
          },
        ],
      });

      return res.status(200).json({
        code: 200,
        parroquias,
      });

    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        msj: "Hubo un problema en la consulta"
      });
    }
  }


  async crearParroquia(req, res) {
    const { nombre, info, externalCanton, tipoParroquia } = req.body;

    if (!nombre || !info || !externalCanton || !tipoParroquia) {
      return res.status(400).json({ msj: "Faltan datos requeridos" });
    }

    const canton = await Canton.findOne({ where: { external: externalCanton } });

    if (!canton) {
      return res.status(404).json({ msj: "El cantón seleccionado no existe" });
    }

    try {
      // 2. Creamos la PARROQUIA
      await Parroquia.create({
        nombre,
        info,
        estado: true,
        tipoParroquia,      // 'URBANA' o 'RURAL'
        cantonId: canton.id // Relación FK (Asegúrate de tener esto en tu modelo)
      });

      return res.status(200).json({ msj: "Parroquia creada correctamente", code: 200 });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msj: "Hubo un error al crear la parroquia" });
    }
  }
  async getParroquiasActivasCanton(req, res) {
    try {
      const externalCanton = req.params.externalCanton
      if (!externalCanton) {
        return res
          .status(404)
          .json({ msj: "Datos faltantes" });
      }
      const canton = await Canton.findOne({ where: { external: externalCanton } });
      if (!canton) {
        return res
          .status(404)
          .json({ msj: "No se encuentra el canton" });
      }
      const parroquias = await Parroquia.findAll({
        where: { estado: true, cantonId: canton.id },
        include: [
          {
            model: Canton,
            as: "Canton",
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
          },
        ],
      });

      return res.status(200).json({
        code: 200,
        parroquias,
      });

    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        msj: "Hubo un problema en la consulta", "error": error
      });
    }
  }

  async getParroquia(req, res) {
    const externalParroquia = req.params.externalParroquia;
    if (!externalParroquia) { return res.status(400).json({ msj: "Datos insuficientes" }); }
    const parroquia = await Parroquia.findOne({
      where: { external: externalParroquia },
      include: [
        {
          model: Canton,
          as: "Canton",
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
        },
      ],
    });
    if (!parroquia) {
      return res.status(400).json({ msj: "No se encontró la parroquia" });
    }
    return res.status(200).json({
      code: 200,
      parroquia,
    });
  }





  async editarParroquia(req, res) {
    const { nombre, info, estado, tipoParroquia, externalParroquia } = req.body;
    const parroquia = await Parroquia.findOne({ where: { external: externalParroquia } });
    if (tipoParroquia != 'RURAL' && tipoParroquia != 'URBANA') {
      return res.status(400).json({ msj: "Datos no válidos" });
    }
    try {
      await parroquia.update({
        nombre: nombre,
        info: info,
        estado: estado,
        tipoParroquia
      });
      return res.status(200).json({ msj: "Parroquia creada correctamente", code: 200 });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msj: "Hubo un error al crear el parroquia" });
    }
  }




}

module.exports = new ParroquiaController();
