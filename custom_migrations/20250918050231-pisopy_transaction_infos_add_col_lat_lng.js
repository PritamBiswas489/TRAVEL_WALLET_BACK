export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "pisopy_transaction_infos",
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
    "pisopy_transaction_infos",
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
  await queryInterface.removeColumn("pisopy_transaction_infos", "latitude", {
    supportsSearchPath: false,
  });
  await queryInterface.removeColumn("pisopy_transaction_infos", "longitude", {
    supportsSearchPath: false,
  });
}
