export async function up(queryInterface, Sequelize) {
   await queryInterface.addColumn(
      'whitelist_mobiles',
      'userId',
      {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      {
        supportsSearchPath: false,
      }
    );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('whitelist_mobiles', 'userId');
}
