export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
   "ninepay_transaction_infos",
    "qr_code",
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
  await queryInterface.removeColumn("ninepay_transaction_infos", "qr_code",{
    supportsSearchPath: false,
  });
}
