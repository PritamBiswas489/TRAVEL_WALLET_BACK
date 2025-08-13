export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
      'wallet_pele_payments',
      'interestRate',
      {
        type: Sequelize.DECIMAL(5, 2), // e.g., 12.50%
        allowNull: true,
        defaultValue: null,
      },
      {
        supportsSearchPath: false,
      }
    );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn(
      'wallet_pele_payments',
      'interestRate',
      {
        supportsSearchPath: false,
      }
    );
}
