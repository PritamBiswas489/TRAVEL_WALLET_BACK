export default function WalletTransaction(sequelize, DataTypes) {
  const WalletTransaction = sequelize.define(
    "WalletTransaction",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "user_id",
      },
      walletId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "wallet_id",
      },
      paymentAmt: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      paymentCurrency: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      oldWalletBalance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      newWalletBalance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("credit", "debit"),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "completed",
      },
      paymentId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null,
        field: "payment_id",
      },
    },
    {
      tableName: "wallet_transactions",
      underscored: true,
      timestamps: true, // Adds createdAt and updatedAt automatically
    }
  );

  return WalletTransaction;
}
