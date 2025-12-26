const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const MultimediaLugar = sequelize.define(
  'MultimediaLugar',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    
    url: {
        type: DataTypes.STRING(255), 
        allowNull: false
    },
    external: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lugarId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lugar',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  },
  {
    tableName: 'multimedialugar',
  }
);

module.exports = MultimediaLugar;