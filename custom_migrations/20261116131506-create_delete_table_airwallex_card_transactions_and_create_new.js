export async function up(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_card_transactions", {
    cascade: true,
    supportsSearchPath: false,
  });

  await queryInterface.createTable(
    "airwallex_card_transactions",
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      webhook_event_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      airwallexAccountId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      card_transaction_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      card_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      billing_amounts: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      digital_wallet_token: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      expiry_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      failure_reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fee_details: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      fund_direction: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lifecycle_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      masked_card_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      merchant: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transaction_amounts: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      rawPayload: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
    },
    { supportsSearchPath: false },
  );

  await queryInterface.addIndex("airwallex_card_transactions", ["user_id"], {
    name: "idx_airwallex_card_transactions_user_id",
  });
  await queryInterface.addIndex("airwallex_card_transactions", ["card_id"], {
    name: "idx_airwallex_card_transactions_card_id",
  });
  await queryInterface.addIndex("airwallex_card_transactions", ["card_transaction_id"], {
    name: "idx_airwallex_card_transactions_card_transaction_id",
  });
  await queryInterface.addIndex("airwallex_card_transactions", ["webhook_event_id"], {
    name: "idx_airwallex_card_transactions_webhook_event_id",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_card_transactions", {
    supportsSearchPath: false,
  });
}
