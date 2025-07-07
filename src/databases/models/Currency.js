 
export default function Currency(sequelize, DataTypes) {
  return sequelize.define(
    "Currency",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      value: {
        type: DataTypes.FLOAT,
        allowNull: false,
      }, 
    },
    {
      tableName: "currencies",
      timestamps: true,
    },
    
  );
}
