export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "airwallex_transaction_dispute",
    {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
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
      dispute_id:{
        type: Sequelize.UUID,
        allowNull: false,

      },
      transaction_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reference: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      updated_by: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      webhookData: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      supportsSearchPath: false,
    },
  );

  await queryInterface.addIndex("airwallex_transaction_dispute", ["user_id"], {
    name: "idx_airwallex_transaction_dispute_user_id",
  });

  await queryInterface.addIndex("airwallex_transaction_dispute", ["transaction_id"], {
    name: "idx_airwallex_transaction_dispute_transaction_id",
  });

  await queryInterface.addIndex("airwallex_transaction_dispute", ["status"], {
    name: "idx_airwallex_transaction_dispute_status",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_transaction_dispute", {
    supportsSearchPath: false,
  });
}
