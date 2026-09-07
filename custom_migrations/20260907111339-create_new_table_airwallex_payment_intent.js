export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "airwallex_payment_intent",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      airwallexIntentId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      merchantOrderId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customerId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      requestId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
      },
      splitAmount: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
      },
      capturedAmount: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      baseAmount: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
      },
      baseCurrency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      descriptor: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      returnUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      morEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      walletAccountId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      topupId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transactionType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fundingType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transferBetweenOwnAccounts: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      recipientAccountNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      recipientFirstName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      recipientLastName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      senderFirstName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      senderLastName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      additionalInfo: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      rawPayload: {
        type: Sequelize.JSONB,
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

  await queryInterface.addIndex("airwallex_payment_intent", ["airwallexIntentId"], {
    name: "idx_airwallex_payment_intent_airwallexIntentId",
    unique: true,
  });

  await queryInterface.addIndex("airwallex_payment_intent", ["userId", "status"], {
    name: "idx_airwallex_payment_intent_userId_status",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_payment_intent", {
    supportsSearchPath: false,
  });
}
