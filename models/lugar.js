const { DataTypes, UUIDV4 } = require("sequelize");
const sequelize = require("../config/config");

const Lugar = sequelize.define(
  "Lugar",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(50) },
    descripcion: { type: DataTypes.STRING(150) },
    longitud: { type: DataTypes.DOUBLE },
    latitud: { type: DataTypes.DOUBLE },
    activo: { type: DataTypes.BOOLEAN },
    horario: { type: DataTypes.STRING(50) },
    imagen: { type: DataTypes.JSON },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
  },

  {
    tableName: "lugar",
    defaultScope: {
      attributes: { exclude: ["id"] },
    },
  }
);
module.exports = Lugar;
