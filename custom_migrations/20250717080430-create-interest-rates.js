export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("interest_rates", {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    paymentNumber: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    interestRate: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },{
    supportsSearchPath: false,
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("interest_rates", {
    supportsSearchPath: false,
  });
}
