export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("airwallex_beneficiary_direct_bank_transfers", {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    beneficiary_list_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: "airwallex_beneficiary_list",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    // Airwallex identifiers
    airwallex_transfer_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    airwallex_beneficiary_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    request_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    short_reference_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    reference: {
      type: Sequelize.STRING(140),
      allowNull: true,
    },
    reason: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    remarks: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    funding_status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // Amounts
    transfer_amount: {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: false,
    },
    transfer_currency: {
      type: Sequelize.STRING(3),
      allowNull: false,
    },
    source_amount: {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: true,
    },
    source_currency: {
      type: Sequelize.STRING(3),
      allowNull: true,
    },
    amount_payer_pays: {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: true,
    },
    amount_beneficiary_receives: {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: true,
    },
    // Conversion
    conversion_currency_pair: {
      type: Sequelize.STRING(7),
      allowNull: true,
    },
    conversion_rate: {
      type: Sequelize.DECIMAL(18, 6),
      allowNull: true,
    },
    // Fees
    fee_amount: {
      type: Sequelize.DECIMAL(18, 2),
      allowNull: true,
    },
    fee_currency: {
      type: Sequelize.STRING(3),
      allowNull: true,
    },
    fee_paid_by: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    swift_charge_option: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    application_fee_options: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
    },
    application_fees: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
    },
    // Transfer details
    transfer_method: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    transfer_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    // Snapshots of beneficiary and payer
    beneficiary_details: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    payer_details: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    airwallex_created_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    airwallex_updated_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });

  await queryInterface.addIndex("airwallex_beneficiary_direct_bank_transfers", ["airwallex_transfer_id"], { name: "idx_airwallex_transfers_transfer_id" });
  await queryInterface.addIndex("airwallex_beneficiary_direct_bank_transfers", ["user_id", "beneficiary_list_id"], { name: "idx_airwallex_transfers_user_beneficiary" });
 
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_beneficiary_direct_bank_transfers");
}
