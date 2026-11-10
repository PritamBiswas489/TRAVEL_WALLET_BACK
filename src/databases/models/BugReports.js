export default function BugReports(sequelize, DataTypes) {
  const BugReports = sequelize.define(
    "BugReports",
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
      severityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      placeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      bugDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bugReproduce: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deviceInformation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      attachment: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      isBlocking: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      isBlocking:{
          type: DataTypes.BOOLEAN,
          defaultValue: false,
      }
    },
    {
      tableName: "bug_reports",
      timestamps: true,
      hooks: {
        async afterCreate(report, options) {
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          await report.update(
            { tktId: `RPT-${date}-${String(report.id).padStart(4, "0")}` },
            { transaction: options.transaction, hooks: false, silent: true },
          );
        },
      },
    },
  );
  return BugReports;
}
