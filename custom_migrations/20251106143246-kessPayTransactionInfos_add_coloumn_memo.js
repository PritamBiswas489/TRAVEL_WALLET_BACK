export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
    "kesspay_transaction_infos",
    "memo",
    {
      type: Sequelize.STRING,
      allowNull: true,
    },
    {
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("kesspay_transaction_infos", "memo", {
    supportsSearchPath: false,
  });
}
