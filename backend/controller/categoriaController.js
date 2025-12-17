const Categoria = require("../models/categoria");

class CategoriaController {
  /* =========================
     GET - Categorías activas
  ========================= */
  async getCategoriasActivas(req, res) {
    try {
      const categorias = await Categoria.findAll({
        where: { estado: true },
        order: [["nombre", "ASC"]],
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
}

module.exports = new CategoriaController();
