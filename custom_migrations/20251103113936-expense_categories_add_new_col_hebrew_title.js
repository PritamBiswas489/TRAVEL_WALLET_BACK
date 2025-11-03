export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "expensesCategories",
    "hebrewTitle",
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
  await queryInterface.removeColumn("expensesCategories", "hebrewTitle", {
    supportsSearchPath: false,
  });
}
