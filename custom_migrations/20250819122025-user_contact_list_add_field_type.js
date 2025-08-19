export async function up(queryInterface, Sequelize) {
   await queryInterface.addColumn(
      'user_contact_list',
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
  await queryInterface.removeColumn('user_contact_list', 'type');
}
