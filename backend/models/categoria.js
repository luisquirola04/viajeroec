const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Categoria = sequelize.define('Categoria', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    padreId: { type: DataTypes.INTEGER, allowNull: true , defaultValue: null},
    nombre: { type: DataTypes.STRING(50) },
    external: {
        type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false,
        unique: true,
    },
    estado: { type: DataTypes.BOOLEAN },

},
    {
        tableName: 'categoria',


    }); module.exports = Categoria