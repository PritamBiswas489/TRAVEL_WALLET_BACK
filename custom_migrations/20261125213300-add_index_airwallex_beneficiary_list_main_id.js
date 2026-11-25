export async function up(queryInterface, Sequelize) {
  await queryInterface.addIndex("airwallex_beneficiary_list", ["main_id"], {
    name: "idx_airwallex_beneficiary_list_main_id",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex(
    "airwallex_beneficiary_list",
    "idx_airwallex_beneficiary_list_main_id",
  );
}
