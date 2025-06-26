export default function InterestRates(sequelize, DataTypes) {
  const InterestRates = sequelize.define(
    "InterestRates",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      paymentNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "payment_number",
      },
      interestRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: "interest_rate",
      },
    },
    {
      tableName: "interest_rates",
      underscored: true,
      timestamps: true,
    }
  );

  return InterestRates;
}
