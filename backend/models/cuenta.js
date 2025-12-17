'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Cuenta = sequelize.define('cuenta', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  contrasena: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  external: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  freezeTableName: true,
  timestamps: true
});

module.exports = Cuenta;
