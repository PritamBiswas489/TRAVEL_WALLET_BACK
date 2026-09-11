export default function AirwallexPaymentIntentRefund(sequelize, DataTypes) {
	const AirwallexPaymentIntentRefund = sequelize.define(
		"AirwallexPaymentIntentRefund",
		{
			id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			paymentId: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			airwallexRefundId: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			requestId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			paymentIntentId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			paymentAttemptId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			merchantOrderId: {
				type: DataTypes.STRING,
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
			status: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			airwallexCreatedAt: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			airwallexUpdatedAt: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			rawPayload: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
		},
		{
			tableName: "airwallex_payment_intent_refund",
			timestamps: true,
			indexes: [
				{
					name: "idx_airwallex_payment_intent_refund_paymentId_airwallexRefundId",
					fields: ["paymentId", "airwallexRefundId"],
				}
			],
		}
	);

	return AirwallexPaymentIntentRefund;
}
