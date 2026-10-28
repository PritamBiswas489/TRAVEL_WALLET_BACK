export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "trip_budgets",
    {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
       },
       userId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      countryCode: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },
      total_budget: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      daily_budget: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
      },
      category_budgets: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
     createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      supportsSearchPath: false,
    }
  );
  await queryInterface.addConstraint("trip_budgets", {
    fields: ["countryCode", "startDate", "endDate"],
    type: "unique",
    name: "trip_budgets_country_date_range_unique",
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("trip_budgets", {
    supportsSearchPath: false,
  });
}
