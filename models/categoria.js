const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Categoria= sequelize.define('Categoria',{
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: {type:DataTypes.STRING(50)},
        uuid: {type:DataTypes.UUID, defaultValue:DataTypes.UUIDV4,allowNull: false,
        unique: true,},

    },
    { tableName: 'categoria',
        defaultScope: {
      attributes: { exclude: ["id"] }, 
    },
       
}); module.exports = Categoria