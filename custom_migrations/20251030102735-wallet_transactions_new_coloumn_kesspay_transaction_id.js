export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "wallet_transactions",
    "kesspayTransactionId",
    {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: "kesspay_transaction_infos",
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
   await queryInterface.removeColumn("wallet_transactions", "kesspayTransactionId", {
    supportsSearchPath: false,
  });
}
