export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "thai_payments",
    "wallet_currency",
    {
      type: Sequelize.STRING(20),
      allowNull: true,
    },{
      supportsSearchPath: false,
    }
  );
  await queryInterface.addColumn(
    "thai_payments",
    "expense_cat_id",
    {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },{
      supportsSearchPath: false,
    }

  );
  await queryInterface.addColumn(
    "thai_payments",
    "wallet_payment_amt",
    {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: true,
    },{
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("thai_payments", "wallet_currency",{
      supportsSearchPath: false,
    });
  await queryInterface.removeColumn("thai_payments", "expense_cat_id",{
      supportsSearchPath: false,
    });
  await queryInterface.removeColumn("thai_payments", "wallet_payment_amt",{
      supportsSearchPath: false,
    });
}
