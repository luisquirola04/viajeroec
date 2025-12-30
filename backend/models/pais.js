const UbicacionAtributos = require('./ubicacion'); 
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');


  const Pais = sequelize.define('Pais', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ...UbicacionAtributos(sequelize, DataTypes), 
        imagen: { type: DataTypes.STRING },

  }, {
    tableName: 'pais',
    
  }); module.exports = Pais;