export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("thai_payments", "qr_code", {
    type: Sequelize.TEXT,
    allowNull: true,
  },{
    supportsSearchPath: false,

  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("thai_payments", "qr_code",{ supportsSearchPath: false });

}
