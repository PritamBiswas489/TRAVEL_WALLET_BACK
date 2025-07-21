export default function TransferRequests(sequelize, DataTypes) {
  const TransferRequests = sequelize.define(
    "TransferRequests",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      sender_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      receiver_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "ILS",
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      message: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "transfer_requests",
      timestamps: true,
    }
  );
  return TransferRequests;
}
