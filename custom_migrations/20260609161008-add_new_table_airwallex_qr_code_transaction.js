export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "airwallex_qr_code_transaction",
    {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
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
      amount: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paymentCountry: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      chargeStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "none",
      },
      refundStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "none",
      },
      chargeId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      refundId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      chargeWebhookData: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      refundWebhookData: {
        type: Sequelize.JSON,
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
    }
  );

  await queryInterface.addIndex('airwallex_qr_code_transaction', ['userId'], {
    name: 'idx_airwallex_qr_code_transaction_userId',
  });

  await queryInterface.addIndex('airwallex_qr_code_transaction', ['chargeId'], {
    name: 'idx_airwallex_qr_code_transaction_chargeId',
  });

  await queryInterface.addIndex('airwallex_qr_code_transaction', ['refundId'], {
    name: 'idx_airwallex_qr_code_transaction_refundId',
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_qr_code_transaction", {
    supportsSearchPath: false,
  });
}
