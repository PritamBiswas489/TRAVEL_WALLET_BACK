export default function TripCountries(sequelize, DataTypes) {
  return sequelize.define(
    "TripCountries",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      countryCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      currencies: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      tableName: "trip_countries",
      timestamps: false,
    }
  );
}