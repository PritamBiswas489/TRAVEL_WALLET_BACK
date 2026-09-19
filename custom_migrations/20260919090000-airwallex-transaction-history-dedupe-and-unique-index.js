export async function up(queryInterface, Sequelize) {
  // Keep the newest row per (userId, airwallexAccountId, apiId), remove older duplicates.
  await queryInterface.sequelize.query(`
    DELETE FROM airwallex_user_transaction_history a
    USING airwallex_user_transaction_history b
    WHERE a.id < b.id
      AND a."userId" = b."userId"
      AND a."airwallexAccountId" = b."airwallexAccountId"
      AND a."apiId" = b."apiId"
      AND a."apiId" IS NOT NULL;
  `);

  await queryInterface.addIndex(
    "airwallex_user_transaction_history",
    ["userId", "airwallexAccountId", "apiId"],
    {
      name: "uq_airwallex_user_txn_history_user_account_apiid",
      unique: true,
      where: {
        apiId: {
          [Sequelize.Op.ne]: null,
        },
      },
    },
  );
}

export async function down(queryInterface) {
  await queryInterface.removeIndex(
    "airwallex_user_transaction_history",
    "uq_airwallex_user_txn_history_user_account_apiid",
  );
}
