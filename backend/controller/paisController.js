const Pais = require("../models/pais");
const Provincia = require("../models/provincia");

require("dotenv").config();
const sequelize = require("../config/config");
const { UUIDV4 } = require("sequelize");

class PaisController {
  async getPaisesActivos(req, res) {
    try {
      const paises = await Pais.findAll({ where: { estado: true } });
      console.log("aaaa" + paises);
      return res.status(200).json({
        code:200,
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
      return res.status(200).json({ msj: "Pais creado correctamente" , code: 200});
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
      return res.status(200).json({ msj: "Pais creado correctamente", code:200 });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ msj: "Hubo un error al crear el pais" });
    }
  }

  async getPais(req,res){
    const externalPais = req.params.externalPais;
if (!externalPais) {
      return res.status(400).json({
        msj: "Datos insuficientes",
        code: 400
      });
    }
    const pais =  await Pais.findOne({where:{external:externalPais}});
     if (!pais) {
      return res.status(400).json({
        msj: "No se encuentra el pais",
        code: 400
      });

    }
    return res.status(200).json({
        pais,
        code: 200
      });
  }



    async cambiarEstadoPais(req, res) {
    const externalPais = req.params.externalPais
    if (!externalPais) {
      return res.status(400).json({
        msj: "Datos insuficientes",
        code: 400
      });
    }
    const pais = await Pais.findOne({
      where: { external: externalPais }
    })
    if (!pais) {
      return res.status(400).json({
        msj: "No se encontro el pais",
        code: 400
      });
    }
    const provincia = await Provincia.findOne({ where: { paisId: pais.id, estado: true } })
    if (provincia&&pais.estado) {
      return res.status(400).json({
        msj: "No se puede eliminar el pais, tiene provincia asociadas",
        code: 400
      });
    }
    try {
      await pais.update(!pais.estado);
    } catch (error) {
      return res.status(400).json({ msj: "Hubo un error al editar el Pais" });

    }
  }
}

module.exports = new PaisController();
