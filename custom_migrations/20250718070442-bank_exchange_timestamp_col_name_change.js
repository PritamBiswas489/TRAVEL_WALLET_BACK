export async function up(queryInterface, Sequelize) {
  await queryInterface.renameColumn('bank_hapoalim_exchange_rates', 'created_at', 'createdAt', {
    supportsSearchPath: false,
  });

  await queryInterface.renameColumn('bank_hapoalim_exchange_rates', 'updated_at', 'updatedAt', {
    supportsSearchPath: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.renameColumn('bank_hapoalim_exchange_rates', 'createdAt', 'created_at', {
    supportsSearchPath: false,
  });

  await queryInterface.renameColumn('bank_hapoalim_exchange_rates', 'updatedAt', 'updated_at', {
    supportsSearchPath: false,
  });
}