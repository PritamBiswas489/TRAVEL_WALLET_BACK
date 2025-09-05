export async function up(queryInterface, Sequelize) {
 await queryInterface.addColumn(
      'wallet_transactions',
      'description_he',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      {
        supportsSearchPath: false,
      }
    );
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('wallet_transactions', 'description_he');
}
