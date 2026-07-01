export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('airwallex_kyc_account', 'webhookData', {
    type: Sequelize.JSONB,
    allowNull: true,
    defaultValue: null,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('airwallex_kyc_account', 'webhookData');
}
