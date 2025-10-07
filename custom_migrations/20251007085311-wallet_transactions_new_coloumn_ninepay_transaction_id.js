export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "wallet_transactions",
    "ninePayTransactionId",
    {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: "ninepay_transaction_infos",
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
   await queryInterface.removeColumn("wallet_transactions", "ninePayTransactionId", {
    supportsSearchPath: false,
  });
}
