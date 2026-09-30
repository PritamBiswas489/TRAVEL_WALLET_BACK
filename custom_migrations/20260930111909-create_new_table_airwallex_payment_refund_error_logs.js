export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "airwallex_payment_refund_error_logs",
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
      },
      methodName: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      payloadData: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      errorLogs: {
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
    },
  );

  await queryInterface.addIndex(
    "airwallex_payment_refund_error_logs",
    ["userId"],
    { name: "idx_airwallex_payment_refund_error_logs_userId" },
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_payment_refund_error_logs", {
    supportsSearchPath: false,
  });
}
