const UbicacionAtributos = require('./ubicacion'); 
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');


  const Parroquia = sequelize.define('Parroquia', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ...UbicacionAtributos(sequelize, DataTypes), 
    tipoParroquia:{type: DataTypes.ENUM('RURAL', 'URBANA')},
    cantonId: { 
            type: DataTypes.INTEGER,
            allowNull: false 
        },
  }, {
    tableName: 'parroquia',
    
  }); module.exports = Parroquia;