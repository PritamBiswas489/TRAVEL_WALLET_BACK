export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
      "pisopy_transaction_infos",
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        transaction_info_code: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        transaction_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        transaction_channel: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        remittance_method_code: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        sender_customer_code: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        sender_customer_details: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        beneficiary_customer_code: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        beneficiary_customer_details: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        relationship: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        purpose: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        client_fee_rebate_json: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
        },
        client_fee: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
        },
        client_rebate: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
        },
        amount_deduct: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
        },
        callback_url: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        qr_code: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        date_time: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        callBack_data:{
          type: Sequelize.JSONB,
          allowNull: true,
        },
        transaction_status: {
          type: Sequelize.STRING,
          allowNull: false, 
          defaultValue: "Pending",
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      {
        supportsSearchPath: false,
      }
    );
}
export async function down(queryInterface, Sequelize) {
   await queryInterface.dropTable("pisopy_transaction_infos", {
      supportsSearchPath: false,
    });
}
