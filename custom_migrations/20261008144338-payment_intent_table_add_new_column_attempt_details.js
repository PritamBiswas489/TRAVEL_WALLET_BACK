export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("airwallex_payment_intent", "cardDetails", {
    type: Sequelize.JSONB,
    allowNull: true,
  });

  await queryInterface.addColumn("airwallex_payment_intent", "attemptDetails", {
    type: Sequelize.JSON,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("airwallex_payment_intent", "attemptDetails");
  await queryInterface.removeColumn("airwallex_payment_intent", "cardDetails");
}
