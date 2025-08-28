export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    'transfer',
    'message',
    {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'status', // Add after "status" column
    },
    {
      supportsSearchPath: false,
    }
   );
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('transfer', 'message',{
      supportsSearchPath: false,
    });
}
