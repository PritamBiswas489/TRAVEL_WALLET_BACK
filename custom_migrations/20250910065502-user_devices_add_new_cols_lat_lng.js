export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
      'user_devices',
      'latitude',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      {
        supportsSearchPath: false,
      }
    );

    await queryInterface.addColumn(
      'user_devices',
      'longitude',
      {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      {
        supportsSearchPath: false,
      }
    );
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user_devices", "latitude", {
      supportsSearchPath: false,
    });
    await queryInterface.removeColumn("user_devices", "longitude", {
      supportsSearchPath: false,
    });
}
