export async function up(queryInterface, Sequelize) {
  // TODO: create table
  await queryInterface.addColumn('thai_payments', 'memo', {
    type: Sequelize.STRING,
    allowNull: true,
  },{
    supportsSearchPath: false,
  });

}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('thai_payments', 'memo', {
    supportsSearchPath: false,
  });
}
