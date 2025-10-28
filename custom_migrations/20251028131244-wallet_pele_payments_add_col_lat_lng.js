export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "wallet_pele_payments",
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
    "wallet_pele_payments",
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
  await queryInterface.removeColumn("wallet_pele_payments", "latitude", {
    supportsSearchPath: false,
  });
  await queryInterface.removeColumn("wallet_pele_payments", "longitude", {
    supportsSearchPath: false,
  });
}
