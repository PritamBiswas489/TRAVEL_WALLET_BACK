export default function TripBudgets(sequelize, DataTypes) {
  return sequelize.define(
    "TripBudgets",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      countryCode: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
      total_budget: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      daily_budget: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },
      category_budgets: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      tableName: "trip_budgets",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["countryCode", "startDate", "endDate"],
          name: "trip_budgets_country_date_range_unique",
        },
      ],
    }
  );
}