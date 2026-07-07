export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("airwallex_card_transactions", "user_id", {
    type: Sequelize.BIGINT,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });

  await queryInterface.addIndex("airwallex_card_transactions", ["user_id"], {
    name: "idx_airwallex_card_transactions_user_id",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex(
    "airwallex_card_transactions",
    "idx_airwallex_card_transactions_user_id",
  );
  await queryInterface.removeColumn("airwallex_card_transactions", "user_id");
}
