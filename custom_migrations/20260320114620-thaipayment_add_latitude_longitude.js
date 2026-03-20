export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "thai_payments",
    "latitude",
    {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    {
      supportsSearchPath: false,
    }
  );

  await queryInterface.addColumn(
    "thai_payments",
    "longitude",
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
  await queryInterface.removeColumn("thai_payments", "latitude", {
    supportsSearchPath: false,
  });
  await queryInterface.removeColumn("thai_payments", "longitude", {
    supportsSearchPath: false,
  });
}
