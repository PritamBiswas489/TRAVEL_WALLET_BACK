 
import moment from "moment-timezone";
export default function Currency(sequelize, DataTypes) {
 const Currency = sequelize.define(
    "Currency",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      value: {
        type: DataTypes.FLOAT,
        allowNull: false,
      }, 
    },
    {
      tableName: "currencies",
      timestamps: true,
    },
    
  );

  Currency.prototype.toJSON = function () {
    const values = { ...this.get() };

    if (values.createdAt) {
      values.createdAt = moment.utc(values.createdAt).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    }

    if (values.updatedAt) {
      values.updatedAt = moment.utc(values.updatedAt).tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
    }

     
    

    return values;
  };

  return Currency;
}
