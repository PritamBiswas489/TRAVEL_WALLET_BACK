export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "users",
    "status",
    {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "active",
    },
    {
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("users", "status", {
    supportsSearchPath: false,
  });
}
