export default function Expenses(sequelize, DataTypes) {
  const Expenses = sequelize.define(
    "Expenses",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "expenses",
      timestamps: true,
    }
  );
  return Expenses;
}
