export async function up(queryInterface, Sequelize) {
   await queryInterface.addColumn(
      'whitelist_mobiles',
      'type',
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
      {
        supportsSearchPath: false,
      }
    );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('whitelist_mobiles', 'type');
}
