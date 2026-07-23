export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('airwallex_user_debit_cards', 'cardDesignType', {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn('airwallex_user_debit_cards', 'cardDesignPresetId', {
    type: Sequelize.INTEGER,
    allowNull: true,
  });

  await queryInterface.addColumn('airwallex_user_debit_cards', 'cardDesignBackground', {
    type: Sequelize.TEXT,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('airwallex_user_debit_cards', 'cardDesignBackground');
  await queryInterface.removeColumn('airwallex_user_debit_cards', 'cardDesignPresetId');
  await queryInterface.removeColumn('airwallex_user_debit_cards', 'cardDesignType');
}
