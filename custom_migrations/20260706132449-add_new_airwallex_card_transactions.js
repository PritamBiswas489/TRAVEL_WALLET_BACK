export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "airwallex_card_transactions",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      
      acquiringInstitutionIdentifier: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      authCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      billingAmount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
      },
      billingCurrency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cardId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      cardNickname: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cardTransactionEventId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cardTransactionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cardTransactionLifecycleId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lifecycleId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      maskedCardNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      merchantCategoryCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      merchantCity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      merchantCountry: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      merchantIdentifier: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      merchantName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      merchantCategory: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      merchantSubCategory: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      networkTransactionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      postedDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      retrievalRef: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      riskActionsPerformed: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      riskFactors: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      threeDSecureOutcome: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transactionAmount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
      },
      transactionCurrency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transactionDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      transactionId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      transactionType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rawPayload: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
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
    {
      supportsSearchPath: false,
    },
  );

  await queryInterface.addIndex("airwallex_card_transactions", ["cardTransactionEventId"], {
    name: "uniq_airwallex_card_transactions_cardTransactionEventId",
    unique: true,
  });

  await queryInterface.addIndex("airwallex_card_transactions", ["transactionId"], {
    name: "idx_airwallex_card_transactions_transactionId",
  });

  await queryInterface.addIndex("airwallex_card_transactions", ["cardId"], {
    name: "idx_airwallex_card_transactions_cardId",
  });

  await queryInterface.addIndex("airwallex_card_transactions", ["status", "transactionDate"], {
    name: "idx_airwallex_card_transactions_status_transactionDate",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_card_transactions", {
    supportsSearchPath: false,
  });
}
