export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('users', 'hexSalt', {
   type: Sequelize.STRING(50),  
   allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('users', 'hexSalt');
}
