export default function PisoPayTransactionInfos(sequelize, DataTypes) {
  return sequelize.define(
    "PisoPayTransactionInfos",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      transaction_info_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      transaction_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transaction_channel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      remittance_method_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sender_customer_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sender_customer_details: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      beneficiary_customer_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      beneficiary_customer_details: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      relationship: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      purpose: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      client_fee_rebate_json: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      client_fee: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      client_rebate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      amount_deduct: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      callback_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      qr_code: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      date_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      callBack_data: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      transaction_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pending",
      },
    },
    {
      tableName: "pisopy_transaction_infos",
      timestamps: true,
    }
  );
}
