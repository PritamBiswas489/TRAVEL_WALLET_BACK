export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    'transfer',
    'uuid',
    {
      type: Sequelize.UUID,
      allowNull: true,
      unique: true,
      after: 'id',
    },
    {
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('transfer', 'uuid', {
    supportsSearchPath: false,
  });
}
