export default function BankhapoalimExchangeRate(sequelize, DataTypes) {
  return sequelize.define(
    "BankhapoalimExchangeRate",
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
      tableName: "bank_hapoalim_exchange_rates",
      timestamps: true,
    }
  );
}
