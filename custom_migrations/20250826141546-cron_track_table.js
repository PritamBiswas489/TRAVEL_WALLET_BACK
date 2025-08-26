export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "CronTrack",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      cronName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastRunAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("CronTrack", {
      supportsSearchPath: false,
    });
}
