export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn('kesspay_transaction_infos', 'transaction_ref', {
    type: Sequelize.STRING,
    allowNull: true
  },{
    supportsSearchPath: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.changeColumn('kesspay_transaction_infos', 'transaction_ref', {
    type: Sequelize.STRING,
    allowNull: false
  },{
    supportsSearchPath: false,
  });
}
