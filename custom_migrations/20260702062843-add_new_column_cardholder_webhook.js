export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('airwallex_card_holders', 'webhookData', {
    type: Sequelize.JSONB,
    allowNull: true,
    defaultValue: null,
  });

  await queryInterface.addColumn('airwallex_card_holders', 'firstVirtualCardApplied', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('airwallex_card_holders', 'firstVirtualCardApplied');
  await queryInterface.removeColumn('airwallex_card_holders', 'webhookData');
}
