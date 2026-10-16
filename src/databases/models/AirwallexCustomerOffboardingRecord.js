export default function AirwallexCustomerOffboardingRecord(sequelize, DataTypes) {
	return sequelize.define(
		"AirwallexCustomerOffboardingRecord",
		{
			id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			customerName: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			customerPhone: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			customerEmail: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			apiId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			accountId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			comment: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			tableName: "airwallex_customer_offboarding_record",
			timestamps: true,
			indexes: [
				{
					name: "idx_airwallex_customer_offboarding_record_apiId",
					fields: ["apiId"],
				},
				{
					name: "idx_airwallex_customer_offboarding_record_accountId",
					fields: ["accountId"],
				},
				{
					name: "idx_airwallex_customer_offboarding_record_customer_phone",
					fields: ["customerPhone"],
				},
			],
		},
	);
}
