export default function AirwallexTransactionDispute(sequelize, DataTypes) {
	const AirwallexTransactionDispute = sequelize.define(
		"AirwallexTransactionDispute",
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
				field: "user_id",
			},
			disputeId: {
				type: DataTypes.UUID,
				allowNull: false,
				field: "dispute_id",
			},
			transactionId: {
				type: DataTypes.UUID,
				allowNull: false,
				field: "transaction_id",
			},
			amount: {
				type: DataTypes.DECIMAL(20, 8),
				allowNull: true,
			},
			notes: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			reason: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			reference: {
				type: DataTypes.UUID,
				allowNull: true,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			webhookData: {
				type: DataTypes.JSONB,
				allowNull: true,
				field: "webhookData",
			},
			updatedBy: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "updated_by",
			},
		},
		{
			tableName: "airwallex_transaction_dispute",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			indexes: [
				{
					name: "idx_airwallex_transaction_dispute_user_id",
					fields: ["user_id"],
				},
				{
					name: "idx_airwallex_transaction_dispute_transaction_id",
					fields: ["transaction_id"],
				},
				{
					name: "idx_airwallex_transaction_dispute_status",
					fields: ["status"],
				},
			],
		},
	);

	return AirwallexTransactionDispute;
}
