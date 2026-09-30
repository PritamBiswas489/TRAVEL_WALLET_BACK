export default function AirwallexPaymentRefundErrorLogs(sequelize, DataTypes) {
	const AirwallexPaymentRefundErrorLogs = sequelize.define(
		"AirwallexPaymentRefundErrorLogs",
		{
			id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			userId: {
				type: DataTypes.BIGINT,
				allowNull: true,
			},
			methodName: {
				type: DataTypes.TEXT,
				allowNull: true,
				defaultValue: null,
			},
			payloadData: {
				type: DataTypes.JSON,
				allowNull: true,
				defaultValue: null,
			},
			errorMessage: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			errorLogs: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
            createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			tableName: "airwallex_payment_refund_error_logs",
			timestamps: false,
			indexes: [
				{
					name: "idx_airwallex_payment_refund_error_logs_userId",
					fields: ["userId"],
				},
			],
		},
	);

	return AirwallexPaymentRefundErrorLogs;
}
