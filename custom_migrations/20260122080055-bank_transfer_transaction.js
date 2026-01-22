
export async function up(queryInterface, Sequelize) {
  // TODO: create table
  await queryInterface.createTable(
    "bank_transfer_transactions",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uuid: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      postData: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      paymentLink: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      webhookData: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      webhookUser: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookPaymentRequest: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookPsuId: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookPaymentMethod: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookRequestedAmount: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookFinalAmount: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookAspspCode: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookAccountNumber: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookPsuMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookReferenceNumber: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookContext: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookTransferType: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookAccountType: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookCorporateId: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookCurrentStatus: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookPreviousStatus: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      webhookTpp: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending",
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
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("bank_transfer_transactions", {
    supportsSearchPath: false,
  });
}
