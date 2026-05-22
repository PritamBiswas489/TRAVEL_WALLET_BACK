export default function AirwallexUserTransactionAdditionalDetails(sequelize, DataTypes) {
  const AirwallexUserTransactionAdditionalDetails = sequelize.define(
    "AirwallexUserTransactionAdditionalDetails",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sourceId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      appTransactionType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description_he: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      jsonData: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      tableName: "airwallex_user_transaction_additional_details",
      timestamps: true,
    }
  );

  return AirwallexUserTransactionAdditionalDetails;
}
