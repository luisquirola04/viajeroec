const Pais = require("../models/pais");
const Provincia = require("../models/provincia");
const Canton = require("../models/canton");
const Parroquia = require("../models/parroquia");

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
    const { nombre, info, externalProvincia } = req.body;
    if (!nombre || !info || !externalProvincia) {
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
  async getCantonesActivosProvincia(req, res) {
    try {
      const externalProvincia = req.params.externalProvincia
      if (!externalProvincia) {
        return res
          .status(404)
          .json({ msj: "Datos faltantes" });
      }
      const provincia = await Provincia.findOne({ where: { external: externalProvincia } });
      if (!provincia) {
        return res
          .status(404)
          .json({ msj: "No se encuentra la provincia" });
      }
      const cantones = await Canton.findAll({
        where: { estado: true, provinciaId: provincia.id },
        order: [['nombre', 'ASC']],
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


  async getCanton(req, res) {

    const externalCanton = req.params.externalCanton
    if (!externalCanton) {
      return res.status(400).json({
        msj: "Datos insuficientes",
        code: 400
      });
    }
    const canton = await Canton.findOne({
      where: { external: externalCanton }, include: [
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
    if (!canton) {
      return res.status(400).json({
        msj: "No se encontro el canton",
        code: 400
      });
    }
    return res.status(200).json({
       canton,
      code: 200
    });
  }

  async editarCanton(req, res) {
            console.log("aaaaa")
   
    console.log(req.body)

    const { nombre, info, estado, externalCanton } = req.body;
    console.log(req.body)
      if (!externalCanton) {
      return res.status(400).json({
        msj: "Datos insuficientes1",
        code: 400
      });
    }
    const canton = await Canton.findOne({ where: { external: externalCanton } });
    if (!canton) {
      return res.status(400).json({
        msj: "No se pudo encontrar el Canton",
        code: 400
      });
    }
    try {
      await canton.update({
        nombre: nombre,
        info: info,
      });
      return res.status(200).json({ msj: "Cantón actualizado correctamente", code: 200 });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msj: "Hubo un error al editar el Cantón" });
    }
  }

  async cambiarEstadoCanton(req, res) {
    const externalCanton = req.params.externalCanton
    if (!externalCanton) {
      return res.status(400).json({
        msj: "Datos insuficientes",
        code: 400
      });
    }
    const canton = await Canton.findOne({
      where: { external: externalCanton }
    })
    if (!canton) {
      return res.status(400).json({
        msj: "No se encontro el canton",
        code: 400
      });
    }
    const parroquia = await Parroquia.findOne({ where: { cantonId: canton.id, estado: true } })
    if (parroquia&&canton.estado) {
      return res.json({
        msj: "No se puede eliminar el canton, tiene parroquias asociadas",
        code: 400
      });
    }
    try {
      console.log("aqui va a ir")
      await canton.update({
  estado: !canton.estado
});
            console.log("yafue")

            return res.status(200).json({ msj: "Cantón actualizado correctamente", code: 200 });

    } catch (error) {
      return res.status(400).json({ msj: "Hubo un error al editar el Cantón" });

    }
  }
}

module.exports = new CantonController();
