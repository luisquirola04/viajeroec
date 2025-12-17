const UbicacionAtributos = require('./ubicacion'); 
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');


  const Provincia = sequelize.define('Provincia', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ...UbicacionAtributos(sequelize, DataTypes), 
    paisId: { 
            type: DataTypes.INTEGER,
            allowNull: false 
        },
  }, {
    tableName: 'provincia',
    
  }); module.exports = Provincia;