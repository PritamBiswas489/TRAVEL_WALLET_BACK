export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "wallet_transactions",
    "transferRequestId",
    {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: "transfer_requests",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    {
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
   await queryInterface.removeColumn("wallet_transactions", "transferRequestId", {
    supportsSearchPath: false,
  });
}
