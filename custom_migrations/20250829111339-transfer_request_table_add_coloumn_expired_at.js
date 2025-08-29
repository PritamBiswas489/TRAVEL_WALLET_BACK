export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transfer_requests', 'expireAt', {
    type: Sequelize.DATE,
    allowNull: true
  }, {
    supportsSearchPath: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('transfer_requests', 'expireAt',{
    supportsSearchPath: false
  });
}
