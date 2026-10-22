export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "airwallex_payment_attempt_records",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      paymentId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "airwallex_payment_intent",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      attemptId: { type: Sequelize.STRING, allowNull: true, unique: true },
      amount: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      capturedAmount: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      refundedAmount: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      currency: { type: Sequelize.STRING(10), allowNull: true },
      status: { type: Sequelize.STRING, allowNull: true },
      authorizationCode: { type: Sequelize.STRING, allowNull: true },
      paymentConsentId: { type: Sequelize.STRING, allowNull: true },
      paymentIntentId: { type: Sequelize.STRING, allowNull: true },
      providerOriginalResponseCode: { type: Sequelize.STRING, allowNull: true },
      providerTransactionId: { type: Sequelize.STRING, allowNull: true },
      settleVia: { type: Sequelize.STRING, allowNull: true },
      authenticationData: { type: Sequelize.JSONB, allowNull: true },
      paymentMethod: { type: Sequelize.JSONB, allowNull: true },
      paymentMethodOptions: { type: Sequelize.JSONB, allowNull: true },
      attemptCreatedAt: { type: Sequelize.DATE, allowNull: true },
      attemptUpdatedAt: { type: Sequelize.DATE, allowNull: true },
      webhookData: { type: Sequelize.JSONB, allowNull: true },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    { supportsSearchPath: false }
  );
 
  await queryInterface.addIndex(
    "airwallex_payment_attempt_records",
    ["paymentIntentId"],
    { name: "airwallex_payment_attempt_records_payment_intent_id_idx" }
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("airwallex_payment_attempt_records", {
    supportsSearchPath: false,
  });
}
