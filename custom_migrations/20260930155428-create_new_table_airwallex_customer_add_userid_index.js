export async function up(queryInterface, Sequelize) {
  await queryInterface.addIndex("airwallex_customers", ["userId"], {
    name: "idx_airwallex_customers_userId",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex(
    "airwallex_customers",
    "idx_airwallex_customers_userId",
  );
}
