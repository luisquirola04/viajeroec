const Pais = require("../models/pais");
const Provincia = require("../models/provincia");
const Canton = require("../models/canton");
const Parroquia = require("../models/parroquia");

require("dotenv").config();
const sequelize = require("../config/config");
const { UUIDV4 } = require("sequelize");

class ParroquiaController {

async getParroquiasActivas(req, res) {
  try {
    const parroquias = await Parroquia.findAll({
      where: { estado: true },
      include: [
        {
          model: Canton,
          as: 'Canton',   
        }
      ]
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
    const { nombre, info, imagen, externalCanton, tipoParroquia } = req.body;

    if (!nombre || !info || !imagen || !externalCanton || !tipoParroquia) {
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
        imagen,
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

module.exports = new ParroquiaController();
