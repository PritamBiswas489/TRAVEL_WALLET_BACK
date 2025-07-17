export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("wallet_transactions", {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    walletId: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    paymentAmt: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    paymentCurrency: {
      type: Sequelize.STRING(3),
      allowNull: true,
    },
    oldWalletBalance: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
    },
    newWalletBalance: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM("credit", "debit"),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "completed",
    },
    paymentId: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: "wallet_pele_payments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    transferId: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: "transfer",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
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
    });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("wallet_transactions", {
    supportsSearchPath: false,
  });
}
