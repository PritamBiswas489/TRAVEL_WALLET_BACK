export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "thai_payments",
    "confirmation_data",
    {
      type: Sequelize.JSON,
      allowNull: true,
    },{
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("thai_payments", "confirmation_data",{
    supportsSearchPath: false,
  });
}
