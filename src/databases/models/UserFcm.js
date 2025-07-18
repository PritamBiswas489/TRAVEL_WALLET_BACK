export default function UserFcm(sequelize, DataTypes) {
  return sequelize.define(
    "UserFcm",
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

      fcmToken: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "user_fcm",
      timestamps: true,
    }
  );
}
