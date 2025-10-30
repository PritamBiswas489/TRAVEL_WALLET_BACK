export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "kesspay_transaction_infos",
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
    "kesspay_transaction_infos",
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
  await queryInterface.removeColumn("kesspay_transaction_infos", "latitude", {
    supportsSearchPath: false,
  });
  await queryInterface.removeColumn("kesspay_transaction_infos", "longitude", {
    supportsSearchPath: false,
  });
}
