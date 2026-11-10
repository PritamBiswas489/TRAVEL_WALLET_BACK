export default function Suggestions(sequelize, DataTypes) {
  const Suggestions = sequelize.define(
    "Suggestions",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      typeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      suggestion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      levelId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "new",
      },
      tktId: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        field: "tkt_id",
      },
    },
    {
      tableName: "suggestions",
      timestamps: true,
      hooks: {
        async afterCreate(suggestion, options) {
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          await suggestion.update(
            { tktId: `RPT-${date}-${String(suggestion.id).padStart(4, "0")}` },
            { transaction: options.transaction, hooks: false, silent: true },
          );
        },
      },
    },
  );

  return Suggestions;
}
