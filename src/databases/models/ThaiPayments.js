export default function ThaiPayments(sequelize, DataTypes) {
  return sequelize.define(
    "ThaiPayments",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      query_params: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      transfer_query_response: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      payment_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      confirmation_data:{
        type: DataTypes.JSON,
        allowNull: true,
      },
      wallet_currency: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      wallet_payment_amt:{
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      expense_cat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      memo:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      latitude:{
        type: DataTypes.TEXT,
        allowNull: true,
      },
      qr_code:{
        type: DataTypes.TEXT,
        allowNull: true,
      },
      amount:{
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
      },
      longitude:{
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "thai_payments",
      timestamps: false,
    }
  );
}
