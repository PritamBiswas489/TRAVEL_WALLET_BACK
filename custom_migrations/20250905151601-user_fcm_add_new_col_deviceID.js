export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'user_fcm',
      'deviceID',
      {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      {
        supportsSearchPath: false,
      }
    );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('user_fcm', 'deviceID');
}
