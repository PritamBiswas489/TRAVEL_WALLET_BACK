export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("users", "passportId", {
    type: Sequelize.STRING,
    allowNull: true,
  },{
    supportsSearchPath: false,
  });
  await queryInterface.addColumn("users", "passportExpiryDate", {
    type: Sequelize.STRING,
    allowNull: true,
  },{
    supportsSearchPath: false,
  });
  await queryInterface.addColumn("users", "nationality", {
    type: Sequelize.STRING,
    allowNull: true,
  },{
    supportsSearchPath: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("users", "passportId",{supportsSearchPath: false});
  await queryInterface.removeColumn("users", "passportExpiryDate",{supportsSearchPath: false});
  await queryInterface.removeColumn("users", "nationality",{supportsSearchPath: false});
}
