export default function UserThaiWalletIds(sequelize, DataTypes) {
  const UserThaiWalletIds = sequelize.define(
    "UserThaiWalletIds",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      wallet_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      external_wallet_user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "user_thai_wallet_ids",
      timestamps: false,
    }
  );

  return UserThaiWalletIds;
}
