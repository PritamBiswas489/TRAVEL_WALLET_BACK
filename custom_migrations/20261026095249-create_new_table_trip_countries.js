export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("trip_countries", {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.JSONB,
      allowNull: false,
    },
    countryCode: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    currencies: {
      type: Sequelize.JSONB,
      allowNull: false,
    },
  }, {
    supportsSearchPath: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("trip_countries", {
    supportsSearchPath: false,
  });
}
