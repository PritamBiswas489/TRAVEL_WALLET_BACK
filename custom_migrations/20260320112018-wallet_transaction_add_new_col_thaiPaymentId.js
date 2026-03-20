export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "wallet_transactions",
    "thaiPaymentId",
    {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: "thai_payments",
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
   await queryInterface.removeColumn("wallet_transactions", "thaiPaymentId", {
    supportsSearchPath: false,
  });
}
