export async function up(queryInterface, Sequelize) {
   await queryInterface.addColumn(
   "kesspay_transaction_infos",
    "out_trade_no",
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
  await queryInterface.removeColumn("kesspay_transaction_infos", "out_trade_no", {
    supportsSearchPath: false,
  });
}
