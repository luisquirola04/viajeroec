const Lugar = require("../models/lugar");
const Categoria = require("../models/categoria");
const Parroquia = require("../models/parroquia");
const Canton = require("../models/canton");
const Provincia = require("../models/provincia");
const Pais = require("../models/pais");
const MultimediaLugar = require("../models/multimediaLugar");
const sequelize = require("../config/config");

class LugarController {
  async crearLugar(req, res) {
    // Iniciamos una transacción
    const t = await sequelize.transaction();

    try {
      const {
        nombre,
        descripcion,
        longitud,
        latitud,
        horario,
        imagenes,
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

        await t.rollback();
        return res.status(400).json({
          msj: "Datos obligatorios faltantes",
          code: 400,
        });
      }


      const categoria = await Categoria.findOne({
        where: { external: externalCategoria, estado: true },
      });

      if (!categoria) {
        await t.rollback();
        return res.status(404).json({ msj: "Categoría no encontrada", code: 404 });
      }


      const parroquia = await Parroquia.findOne({
        where: { external: externalParroquia, estado: true },
      });

      if (!parroquia) {
        await t.rollback();
        return res.status(404).json({ msj: "Parroquia no encontrada", code: 404 });
      }


      const nuevoLugar = await Lugar.create({
        nombre,
        descripcion,
        longitud,
        latitud,
        horario,

        categoriaId: categoria.id,
        parroquiaId: parroquia.id,
        estado: true,
      }, { transaction: t });


      if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {

        const listaImagenes = imagenes.map(url => ({
          url: url,
          lugarId: nuevoLugar.id,
          estado: true
        }));


        await MultimediaLugar.bulkCreate(listaImagenes, { transaction: t });
      }


      await t.commit();

      return res.status(200).json({
        msj: "Lugar creado correctamente",
        code: 200,
        external: nuevoLugar.external
      });

    } catch (error) {
      // Si algo falla, deshacemos todo
      if (t) await t.rollback();
      console.error(error);
      return res.status(500).json({
        msj: "Error al crear el lugar",
        error: error.message
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
            model: MultimediaLugar,
            as: "Multimedia",
            attributes: ["url", "external"],
            where: { estado: true },
            required: false
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
      console.error(error);
      return res.status(500).json({
        msj: "Hubo un problema en la consulta",
        error: error.message
      });
    }
  }

  async editarLugar(req, res) {
    const t = await sequelize.transaction();

    try {
      const {
        nombre,
        descripcion,
        longitud,
        latitud,
        horario,
        imagenes,
        externalLugar
      } = req.body;


      if (
        !nombre ||
        !descripcion ||
        longitud === undefined ||
        latitud === undefined ||
        !externalLugar
      ) {
        await t.rollback();
        return res.status(400).json({
          msj: "Datos obligatorios faltantes",
          code: 400,
        });
      }


      const lugar = await Lugar.findOne({
        where: { external: externalLugar, estado: true },
      });

      if (!lugar) {
        await t.rollback();
        return res.status(404).json({ msj: "Lugar no encontrado", code: 404 });
      }


      await lugar.update({
        nombre,
        descripcion,
        longitud,
        latitud,
        horario,

      }, { transaction: t });



      if (imagenes && Array.isArray(imagenes)) {


        await MultimediaLugar.update(
          { estado: false },
          {
            where: { lugarId: lugar.id },
            transaction: t
          }
        );


        if (imagenes.length > 0) {
          const listaImagenes = imagenes.map(url => ({
            url: url,
            lugarId: lugar.id,
            estado: true
          }));

          await MultimediaLugar.bulkCreate(listaImagenes, { transaction: t });
        }
      }


      await t.commit();

      return res.status(200).json({
        msj: "Lugar actualizado correctamente",
        code: 200,
        external: lugar.external
      });

    } catch (error) {

      if (t) await t.rollback();
      console.error(error);
      return res.status(500).json({
        msj: "Error al editar el lugar",
        error: error.message
      });
    }
  }

  async getLugar(req, res) {
    try {
      const { externalLugar } = req.params;

      if (!externalLugar) {
        return res.status(400).json({
          code: 400,
          msg: "Datos insuficientes"
        });
      }

      const lugar = await Lugar.findOne({
        where: { external: externalLugar, estado: true },
        attributes: ['id', 'external', 'nombre', 'descripcion', 'horario', 'latitud', 'longitud'],
        include: [
          {
            model: Categoria,
            as: 'Categoria',
            attributes: ['nombre', 'external']
          },
          {
            model: Parroquia,
            as: 'Parroquia',
            attributes: ['nombre', 'external']
          },
          {
            model: MultimediaLugar,
            as: 'Multimedia',
            where: { estado: true },
            required: false,
            attributes: ['url', 'external']
          }
        ]
      });

      if (!lugar) {
        return res.status(404).json({
          code: 404,
          msg: "No se encontró el lugar"
        });
      }

      return res.status(200).json({
        code: 200,
        msg: "OK",
        data: lugar
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        code: 500,
        msg: "Error en el servidor",
        error: error.message
      });
    }
  }

  async eliminarLugar(req, res) {

    const t = await sequelize.transaction();

    try {
      const { externalLugar } = req.params;

      if (!externalLugar) {
        await t.rollback();
        return res.status(400).json({
          code: 400,
          msg: "Datos insuficientes"
        });
      }


      const lugar = await Lugar.findOne({
        where: { external: externalLugar, estado: true }
      });

      if (!lugar) {
        await t.rollback();
        return res.status(404).json({
          code: 404,
          msg: "No se encontró el lugar"
        });
      }

      await lugar.update({ estado: false }, { transaction: t });


      await MultimediaLugar.update(
        { estado: false },
        {
          where: { lugarId: lugar.id },
          transaction: t
        }
      );
      await t.commit();

      return res.status(200).json({
        code: 200,
        msg: "Lugar eliminado correctamente",
      });

    } catch (error) {

      if (t) await t.rollback();
      console.error(error);
      return res.status(500).json({
        code: 500,
        msg: "Error al eliminar el lugar"
      });
    }
  }


}

module.exports = new LugarController();