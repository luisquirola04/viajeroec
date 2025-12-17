const Lugar = require("../models/lugar");
const Categoria = require("../models/categoria");
const Parroquia = require("../models/parroquia");
const Canton = require("../models/canton");
const Provincia = require("../models/provincia");
const Pais = require("../models/pais");

class LugarController {
  async crearLugar(req, res) {
    const {
      nombre,
      descripcion,
      longitud,
      latitud,
      horario,
      imagen,
      externalCategoria,
      externalParroquia,
    } = req.body;

    if (
      !nombre ||
      !descripcion ||
      longitud === undefined ||
      latitud === undefined ||
      !externalCategoria ||
      !externalParroquia
    ) {
      return res.status(400).json({
        msj: "Datos obligatorios faltantes",
        code: 400,
      });
    }

    try {
      const categoria = await Categoria.findOne({
        where: { external: externalCategoria, estado: true },
      });

      if (!categoria) {
        return res.status(404).json({
          msj: "Categoría no encontrada",
          code: 404,
        });
      }

      const parroquia = await Parroquia.findOne({
        where: { external: externalParroquia, estado: true },
      });

      if (!parroquia) {
        return res.status(404).json({
          msj: "Parroquia no encontrada",
          code: 404,
        });
      }

      await Lugar.create({
        nombre,
        descripcion,
        longitud,
        latitud,
        horario,
        imagen,
        categoriaId: categoria.id,
        parroquiaId: parroquia.id,
        estado: true,
      });

      return res.status(200).json({
        msj: "Lugar creado correctamente",
        code: 200,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        msj: "Error al crear el lugar",
      });
    }
  }

  async getLugaresActivos(req, res) {
    try {
      const lugares = await Lugar.findAll({
        where: { estado: true },
        order: [["nombre", "ASC"]],
        include: [
          {
            model: Categoria,
            as: "Categoria",
            attributes: ["id", "nombre", "external"],
          },
          {
            model: Parroquia,
            as: "Parroquia",
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
          },
        ],
      });

      return res.status(200).json({
        code: 200,
        lugares,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        msj: "Hubo un problema en la consulta",
      });
    }
  }
}

module.exports = new LugarController();
