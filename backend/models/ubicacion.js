module.exports = (sequelize, DataTypes) => {
  return {
    nombre: { type: DataTypes.STRING, allowNull: false },
    info: { type: DataTypes.STRING },
    imagen: { type: DataTypes.STRING },
    estado: {type: DataTypes.BOOLEAN},
    external: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4,allowNull: false,unique: true,}
    
  };
};