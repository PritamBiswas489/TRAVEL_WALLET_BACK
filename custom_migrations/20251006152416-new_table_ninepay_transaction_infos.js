export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "ninepay_transaction_infos",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      request_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      partner_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      bank_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      account_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      account_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      account_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      request_amount: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      transfer_amount: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "PENDING",
      },
      date_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      fee: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      extra_data: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      callBack_data: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      expenseCatId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "expensesCategories", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      memo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      walletCurrency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amountInUserWalletCurrency: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      latitude: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      longitude: {
        type: Sequelize.TEXT,
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
    },
    {
      supportsSearchPath: false,
    }
  );
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("ninepay_transaction_infos", {
    supportsSearchPath: false,
  });
}
