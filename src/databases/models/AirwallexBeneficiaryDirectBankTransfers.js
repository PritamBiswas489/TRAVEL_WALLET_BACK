export default function AirwallexBeneficiaryDirectBankTransfers(sequelize, DataTypes) {
  const AirwallexBeneficiaryDirectBankTransfers = sequelize.define(
    "AirwallexBeneficiaryDirectBankTransfers",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: "user_id",
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      beneficiaryListId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: "beneficiary_list_id",
        references: {
          model: "airwallex_beneficiary_list",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      airwallexTransferId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "airwallex_transfer_id",
      },
      airwallexBeneficiaryId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "airwallex_beneficiary_id",
      },
      requestId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: "request_id",
      },
      shortReferenceId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "short_reference_id",
      },
      reference: {
        type: DataTypes.STRING(140),
        allowNull: true,
        field: "reference",
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "reason",
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "remarks",
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "status",
      },
      fundingStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "funding_status",
      },
      transferAmount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        field: "transfer_amount",
      },
      transferCurrency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        field: "transfer_currency",
      },
      sourceAmount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        field: "source_amount",
      },
      sourceCurrency: {
        type: DataTypes.STRING(3),
        allowNull: true,
        field: "source_currency",
      },
      amountPayerPays: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        field: "amount_payer_pays",
      },
      amountBeneficiaryReceives: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        field: "amount_beneficiary_receives",
      },
      conversionCurrencyPair: {
        type: DataTypes.STRING(7),
        allowNull: true,
        field: "conversion_currency_pair",
      },
      conversionRate: {
        type: DataTypes.DECIMAL(18, 6),
        allowNull: true,
        field: "conversion_rate",
      },
      feeAmount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        field: "fee_amount",
      },
      feeCurrency: {
        type: DataTypes.STRING(3),
        allowNull: true,
        field: "fee_currency",
      },
      feePaidBy: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "fee_paid_by",
      },
      swiftChargeOption: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "swift_charge_option",
      },
      applicationFeeOptions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        field: "application_fee_options",
      },
      applicationFees: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        field: "application_fees",
      },
      transferMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "transfer_method",
      },
      transferDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "transfer_date",
      },
      beneficiaryDetails: {
        type: DataTypes.JSON,
        allowNull: true,
        field: "beneficiary_details",
      },
      payerDetails: {
        type: DataTypes.JSON,
        allowNull: true,
        field: "payer_details",
      },
      airwallexCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "airwallex_created_at",
      },
      airwallexUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "airwallex_updated_at",
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "updated_at",
      },
    },
    {
      tableName: "airwallex_beneficiary_direct_bank_transfers",
      timestamps: true,
      indexes: [
        {
          name: "idx_airwallex_transfers_transfer_id",
          fields: ["airwallex_transfer_id"],
        },
        {
          name: "idx_airwallex_transfers_user_beneficiary",
          fields: ["user_id", "beneficiary_list_id"],
        },
      ],
    }
  );

  return AirwallexBeneficiaryDirectBankTransfers;
}
