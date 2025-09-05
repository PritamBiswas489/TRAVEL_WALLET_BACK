export default function UserDevices(sequelize, DataTypes) {
  const UserDevices = sequelize.define(
    "UserDevices",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      deviceName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      deviceID: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "user_devices",
      timestamps: true,
    }
  );
  return UserDevices;
}
