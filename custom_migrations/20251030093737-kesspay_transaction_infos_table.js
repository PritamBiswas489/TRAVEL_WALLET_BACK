export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "kesspay_transaction_infos",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
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
      transactionCurrency: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      transactionAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      walletCurrency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      qr_code: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      merchantName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      merchantCity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amountInUserWalletCurrency: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      callBack_data: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      transaction_ref: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      transaction_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Pending",
      },
      receiver_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      receiver_bank: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      receiver_bakong_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      receiver_acc_info: {
        type: Sequelize.STRING,
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
  await queryInterface.dropTable("kesspay_transaction_infos", {
    supportsSearchPath: false,
  });
}
