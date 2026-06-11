export default function AirwallexQrCodeTransaction(sequelize, DataTypes) {
	const AirwallexQrCodeTransaction = sequelize.define(
		"AirwallexQrCodeTransaction",
		{
			id: {
				type: DataTypes.UUID,
				allowNull: false,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			userId: {
				type: DataTypes.BIGINT,
				allowNull: true,
			},
			amount: {
				type: DataTypes.DECIMAL(20, 2),
				allowNull: true,
			},
			currency: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			paymentCountry: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			chargeStatus: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "none",
			},
			refundStatus: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "none",
			},
			chargeId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			refundId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			chargeWebhookData: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			refundWebhookData: {
				type: DataTypes.JSON,
				allowNull: true,
			},
		},
		{
			tableName: "airwallex_qr_code_transaction",
			timestamps: true,
		}
	);

	return AirwallexQrCodeTransaction;
}
