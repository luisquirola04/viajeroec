const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Lugar = sequelize.define(
  "Lugar",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    nombre: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    longitud: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },

    latitud: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },

    horario: {
      type: DataTypes.STRING(50),
    },


    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    external: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },

    parroquiaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    categoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "lugar",
    timestamps: true,
  }
);

module.exports = Lugar;
