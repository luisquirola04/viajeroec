const UbicacionAtributos = require('./ubicacion'); 
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');


  const Canton = sequelize.define('Canton', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ...UbicacionAtributos(sequelize, DataTypes), 
  }, {
    tableName: 'canton',
    defaultScope: {
      attributes: { exclude: ["id"] }, 
    },
  }); module.exports = Canton;