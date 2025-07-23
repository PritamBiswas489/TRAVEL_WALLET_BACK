export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('users', 'language', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'he',
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('users', 'language');
}
