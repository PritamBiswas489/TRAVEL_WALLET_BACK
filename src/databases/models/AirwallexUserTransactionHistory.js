export default function AirwallexUserTransactionHistory(sequelize, DataTypes) {
  const AirwallexUserTransactionHistory = sequelize.define(
    "AirwallexUserTransactionHistory",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      airwallexAccountId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      apiId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      apiSource: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      balance: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      fee: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true,
      },
      postedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      sourceType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transactionType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transactionGlobalType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transactionGlobalTypeText: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transactionGlobalTypeDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "airwallex_user_transaction_history",
      timestamps: true,
    }
  );

  return AirwallexUserTransactionHistory;
}
