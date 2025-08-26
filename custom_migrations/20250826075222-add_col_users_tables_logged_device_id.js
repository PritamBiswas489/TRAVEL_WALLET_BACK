export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'logged_device_id', {
    type: Sequelize.STRING,
    allowNull: true
  }, {
    supportsSearchPath: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('users', 'logged_device_id',{
    supportsSearchPath: false
  });
}
