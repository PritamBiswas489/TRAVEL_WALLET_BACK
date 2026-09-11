export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "airwallex_payment_intent_refund",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      paymentId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "airwallex_payment_intent",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      airwallexRefundId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      requestId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paymentIntentId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paymentAttemptId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      merchantOrderId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      airwallexCreatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      airwallexUpdatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      rawPayload: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      supportsSearchPath: false,
    },
  );

  await queryInterface.addIndex("airwallex_payment_intent_refund", ["paymentId", "airwallexRefundId"], {
    name: "idx_airwallex_payment_intent_refund_paymentId_airwallexRefundId",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_payment_intent_refund", {
    supportsSearchPath: false,
  });
}
