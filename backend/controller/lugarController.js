const Lugar = require("../models/lugar");
const Categoria = require("../models/categoria");
const Parroquia = require("../models/parroquia");
const Canton = require("../models/canton");
const Provincia = require("../models/provincia");
const Pais = require("../models/pais");
const MultimediaLugar = require("../models/multimediaLugar"); // Asegúrate que la ruta sea correcta
const sequelize = require("../config/config"); // Necesario para la transacción

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
}

module.exports = new LugarController();