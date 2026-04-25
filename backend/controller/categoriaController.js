const Categoria = require("../models/categoria");

class CategoriaController {
  /* =========================
     GET - Categorías activas
  ========================= */
  async getCategoriasActivas(req, res) {
    try {
      const categorias = await Categoria.findAll({
        where: { estado: true, padreId: null },

      });

      return res.status(200).json({
        code: 200,
        categorias,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        msj: "Hubo un problema en la consulta",
      });
    }
  }
  async getCategoriasActivasHijas(req, res) {
    try {
      const { externalPadre } = req.params;
      if (!externalPadre) {
        return res.status(400).json({
          msj: "La categoria padre es obligatoria",
          code: 400,
        });
      }
      const padre = await Categoria.findOne({ where: { external: externalPadre } });
      if (!padre) {
        return res.status(404).json({
          msj: "No se encontro el padre",
          code: 400,
        });
      }
      const categorias = await Categoria.findAll({
        where: { estado: true, padreId: padre.id },

      });

      return res.status(200).json({
        code: 200,
        categorias,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        msj: "Hubo un problema en la consulta",
      });
    }
  }

  /* =========================
     POST - Crear categoría
  ========================= */
  async crearCategoria(req, res) {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({
        msj: "El nombre de la categoría es obligatorio",
        code: 400,
      });
    }

    try {
      await Categoria.create({
        nombre,
        estado: true,
      });

      return res.status(200).json({
        msj: "Categoría creada correctamente",
        code: 200,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(400).json({
        msj: "Hubo un error al crear la categoría",
      });
    }
  }



  async crearCategoriaHija(req, res) {
    const { nombre, externalPadre } = req.body;

    if (!nombre || !externalPadre) {
      return res.status(400).json({
        msj: "Datos obligatorios faltantes",
        code: 400,
      });
    }
    const padre = await Categoria.findOne({ where: { external: externalPadre } });
    if (!padre) {
      return res.status(404).json({
        msj: "No se encontro el padre",
        code: 404,
      });
    }
    try {
      await Categoria.create({
        nombre,
        estado: true,
        padreId: padre.id

      });

      return res.status(200).json({
        msj: "Categoría hija creada correctamente",
        code: 200,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(400).json({
        msj: "Hubo un error al crear la categoría hija",
      });
    }
  }

  async editarCategoria(req,res){
    const{nombre, estado, externalCategoria}= req.body;
    if (!externalCategoria) {
      return res.status(400).json({
        msj: "Datos insuficientes",
        code: 400
      });
    }
    const categoria = await Categoria.findOne({where:{external:externalCategoria}})
    if (!categoria) {
      return res.status(400).json({
        msj: "No se encuentra la categoría",
        code: 400
      });
    }
    try {
      await categoria.update({
      nombre, estado
    } )
     return res.status(200).json({
        msj: "Categoría guardada correctamente",
        code: 200,
      });
    } catch (error) {
      return res.status(500).json({
        msj: "Error en el servidor "+ error.message ,
        code: 400
      });
    }
    
  }

  async getCategoria(req,res){
    const externalCategoria = req.params.externalCategoria;
if (!externalCategoria) {
      return res.status(400).json({
        msj: "Datos insuficientes",
        code: 400
      });
    }
    const categoria =  await Categoria.findOne({where:{external:externalCategoria}});
     if (!categoria) {
      return res.status(400).json({
        msj: "No se encuentra la categoría",
        code: 400
      });

    }
    return res.status(200).json({
        categoria,
        code: 200
      });
  }


  async cambiarEstadoCategoria(req, res) {
    const externalCategoria = req.params.externalCategoria
    if (!externalCategoria) {
      return res.status(400).json({
        msj: "Datos insuficientes",
        code: 400
      });
    }
    const categoria = await Categoria.findOne({
      where: { external: externalCategoria }
    })
    if (!categoria) {
      return res.status(400).json({
        msj: "No se encontro la categoría",
        code: 400
      });
    }
    const categoriasHijas = await Categoria.findAll({ where: { padreId: categoria.id, estado: true } })
    if (categoriasHijas&&categoria.estado) {
      return res.status(400).json({
        msj: "No se puede eliminar el pais, tiene categorias hijas asociadas",
        code: 400
      });
    }
    try {
      await categoria.update(!categoria.estado);
    } catch (error) {
      return res.status(400).json({ msj: "Hubo un error al editar la Categoria" });

    }
  }

}

module.exports = new CategoriaController();
