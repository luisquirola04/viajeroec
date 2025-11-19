const UbicacionAtributos = require('./ubicacion'); 
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');


  const Parroquia = sequelize.define('Parroquia', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ...UbicacionAtributos(sequelize, DataTypes), 
    tipoParroquia:{type: DataTypes.ENUM('rural', 'urbana')},
  }, {
    tableName: 'parroquia',
    defaultScope: {
      attributes: { exclude: ["id"] }, 
    },
  }); module.exports = Parroquia;