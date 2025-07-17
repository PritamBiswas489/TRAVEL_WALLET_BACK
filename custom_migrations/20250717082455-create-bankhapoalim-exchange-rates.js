export async function up(queryInterface, Sequelize) {
   await queryInterface.createTable('bank_hapoalim_exchange_rates', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      value: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    },
    {
      supportsSearchPath: false,
    });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("bank_hapoalim_exchange_rates", {
    supportsSearchPath: false,
  });
}
