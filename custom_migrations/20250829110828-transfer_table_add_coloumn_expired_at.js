export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transfer', 'expireAt', {
    type: Sequelize.DATE,
    allowNull: true
  }, {
    supportsSearchPath: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('transfer', 'expireAt',{
    supportsSearchPath: false
  });
}
