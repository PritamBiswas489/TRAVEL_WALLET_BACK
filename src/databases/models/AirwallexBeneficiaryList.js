export default function AirwallexBeneficiaryList(sequelize, DataTypes) {
  const AirwallexBeneficiaryList = sequelize.define(
    "AirwallexBeneficiaryList",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      mainId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "main_id",
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "nickname"
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "type"
      },
      entityType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "entity_type"
      },
      payerEntityType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "payer_entity_type"
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "account_name"
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "account_number"
      },
      accountCurrency: {
        type: DataTypes.STRING(3),
        allowNull: true,
        field: "account_currency"
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "bank_name"
      },
      bankCountryCode: {
        type: DataTypes.STRING(2),
        allowNull: true,
        field: "bank_country_code"
      },
      swiftCode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "swift_code"
      },
      streetAddress: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "street_address"
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "city"
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "state"
      },
      postcode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "postcode"
      },
      countryCode: {
        type: DataTypes.STRING(2),
        allowNull: true,
        field: "country_code"
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "date_of_birth"
      },
      personalEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "personal_email"
      },
      transferMethods: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        field: "transfer_methods"
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "created_at"
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "updated_at"
      },
    },
    {
      tableName: "airwallex_beneficiary_list",
      timestamps: true,
      indexes: [
        {
          fields: ["userId"],
        },
      ],
    }
  );

  return AirwallexBeneficiaryList;
}
