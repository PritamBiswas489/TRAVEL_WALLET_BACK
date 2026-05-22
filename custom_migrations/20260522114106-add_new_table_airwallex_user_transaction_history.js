export async function up(queryInterface, Sequelize) {
  // TODO: create table
  await queryInterface.createTable(
    "airwallex_user_transaction_history",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      airwallexAccountId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      apiId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      apiSource: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      balance: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      fee: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
      },
      postedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sourceType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transactionType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      accountType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transactionGlobalType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transactionGlobalTypeText: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transactionGlobalTypeDescription: {
        type: Sequelize.TEXT,
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

  await queryInterface.addIndex('airwallex_user_transaction_history', ['userId'], {
    name: 'idx_airwallex_user_transaction_history_userId',
  });

  await queryInterface.addIndex('airwallex_user_transaction_history', ['userId', 'transactionType'], {
    name: 'idx_airwallex_user_transaction_history_userId_transactionType',
  });

  await queryInterface.addIndex('airwallex_user_transaction_history', ['userId', 'transactionGlobalType'], {
    name: 'idx_airwallex_user_transaction_history_userId_transactionGlobalType',
  });

  await queryInterface.addIndex('airwallex_user_transaction_history', ['userId', 'sourceType'], {
    name: 'idx_airwallex_user_transaction_history_userId_sourceType',
  });
}

export async function down(queryInterface, Sequelize) {
  // TODO: drop table
  await queryInterface.dropTable("airwallex_user_transaction_history", {
    supportsSearchPath: false,
  });
}
