export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "wallet_transactions",
    "airwallexPaymentId",
    {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: "wallet_airwallex_payments",
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
   await queryInterface.removeColumn("wallet_transactions", "airwallexPaymentId", {
    supportsSearchPath: false,
  });
}
