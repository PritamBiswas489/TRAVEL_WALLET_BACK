export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('users', 'address', {
    type: Sequelize.STRING,
    allowNull: true,
  });
  await queryInterface.addColumn('users', 'dob', {
    type: Sequelize.STRING,
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('users', 'address');
  await queryInterface.removeColumn('users', 'dob');
}
