const UbicacionAtributos = require('./ubicacion'); 
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');


  const Canton = sequelize.define('Canton', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ...UbicacionAtributos(sequelize, DataTypes), 
      provinciaId: { 
            type: DataTypes.INTEGER,
            allowNull: false 
        },
  }, {
    tableName: 'canton',
  
  }); module.exports = Canton;