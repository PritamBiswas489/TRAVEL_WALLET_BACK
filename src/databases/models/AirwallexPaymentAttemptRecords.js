export default function AirwallexPaymentAttemptRecords(sequelize, DataTypes) {
  const AirwallexPaymentAttemptRecords = sequelize.define(
    "AirwallexPaymentAttemptRecords",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      paymentId: { type: DataTypes.BIGINT, allowNull: true },
      attemptId: { type: DataTypes.STRING, allowNull: true, unique: true },
      amount: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      capturedAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      refundedAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
      currency: { type: DataTypes.STRING(10), allowNull: true },
      status: { type: DataTypes.STRING, allowNull: true },
      authorizationCode: { type: DataTypes.STRING, allowNull: true },
      paymentConsentId: { type: DataTypes.STRING, allowNull: true },
      paymentIntentId: { type: DataTypes.STRING, allowNull: true },
      providerOriginalResponseCode: { type: DataTypes.STRING, allowNull: true },
      providerTransactionId: { type: DataTypes.STRING, allowNull: true },
      settleVia: { type: DataTypes.STRING, allowNull: true },
      authenticationData: { type: DataTypes.JSONB, allowNull: true },
      paymentMethod: { type: DataTypes.JSONB, allowNull: true },
      paymentMethodOptions: { type: DataTypes.JSONB, allowNull: true },
      attemptCreatedAt: { type: DataTypes.DATE, allowNull: true },
      attemptUpdatedAt: { type: DataTypes.DATE, allowNull: true },
      webhookData: { type: DataTypes.JSONB, allowNull: true },
    },
    {
      tableName: "airwallex_payment_attempt_records",
      timestamps: true,
      indexes: [
        
        {
          name: "airwallex_payment_attempt_records_payment_intent_id_idx",
          fields: ["paymentIntentId"],
        },
      ],
    },
  );

  return AirwallexPaymentAttemptRecords;
}
