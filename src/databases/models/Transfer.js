import moment from "moment-timezone";
import "../../config/environment.js";
export default function Transfer(sequelize, DataTypes) {
  const Transfer = sequelize.define(
    "Transfer",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      senderId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      receiverId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "transfer",
      timestamps: true,
    }
  );
  Transfer.prototype.toJSON = function () {
    const values = { ...this.dataValues };

    if (values.createdAt) {
      values.createdAt = moment.utc(values.createdAt).tz(process.env.TIMEZONE).format("YYYY-MM-DD HH:mm:ss");
    }

    if (values.updatedAt) {
      values.updatedAt = moment.utc(values.updatedAt).tz(process.env.TIMEZONE).format("YYYY-MM-DD HH:mm:ss");
    }

    return values;
  };
  return Transfer;
}
