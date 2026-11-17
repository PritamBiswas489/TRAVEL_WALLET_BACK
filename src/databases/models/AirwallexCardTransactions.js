export default function AirwallexCardTransactions(sequelize, DataTypes) {
	const AirwallexCardTransactions = sequelize.define(
		"AirwallexCardTransactions",
		{
			id: {
				type: DataTypes.BIGINT,
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
			},
			userId: {
				type: DataTypes.BIGINT,
				allowNull: true,
				field: "user_id",
				references: {
					model: "users",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			webhookEventId: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "webhook_event_id",
			},
			airwallexAccountId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			cardTransactionId: {
				type: DataTypes.UUID,
				allowNull: true,
				field: "card_transaction_id",
			},
			cardId: {
				type: DataTypes.UUID,
				allowNull: false,
				field: "card_id",
			},
			billingAmounts: {
				type: DataTypes.JSONB,
				allowNull: true,
				field: "billing_amounts",
			},
			created_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			digitalWalletToken: {
				type: DataTypes.JSONB,
				allowNull: true,
				field: "digital_wallet_token",
			},
			expiryDate: {
				type: DataTypes.DATEONLY,
				allowNull: true,
				field: "expiry_date",
			},
			failureReason: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "failure_reason",
			},
			feeDetails: {
				type: DataTypes.JSONB,
				allowNull: true,
				field: "fee_details",
			},
			fundDirection: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "fund_direction",
			},
			lifecycleId: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "lifecycle_id",
			},
			maskedCardNumber: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "masked_card_number",
			},
			merchant: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			transactionAmounts: {
				type: DataTypes.JSONB,
				allowNull: true,
				field: "transaction_amounts",
			},
			updated_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			rawPayload: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			billingUsageAmt: {
				type: DataTypes.DECIMAL(18, 2),
				allowNull: true,
				field: "billing_usage_amt",
			},
			billingWalletCur: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "billing_wallet_cur",
			},
			billingChargePercentage: {
				type: DataTypes.DECIMAL(5, 2),
				allowNull: true,
				field: "billing_charge_percentage",
			},
			billingChargedAmount: {
				type: DataTypes.DECIMAL(18, 2),
				allowNull: true,
				field: "billing_charged_amount",
			},
			billingTotal: {
				type: DataTypes.DECIMAL(18, 2),
				allowNull: true,
				field: "billing_total",
			},
			chargeStatus: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "charge_status",
			},
			chargePaymentLogs: {
				type: DataTypes.JSONB,
				allowNull: true,
				field: "charge_payment_logs",
			},
			chargePaymentWebhooks: {
				type: DataTypes.JSONB,
				allowNull: true,
				field: "charge_payment_webhooks",
			},
			chargeId: {
				type: DataTypes.UUID,
				allowNull: true,
				field: "charge_id",
			},

		},
		{
			tableName: "airwallex_card_transactions",
			timestamps: true,
			indexes: [
				{
					name: "idx_airwallex_card_transactions_user_id",
					fields: ["user_id"],
				},
				{
					name: "idx_airwallex_card_transactions_card_id",
					fields: ["card_id"],
				},
				{
					name: "idx_airwallex_card_transactions_card_transaction_id",
					fields: ["card_transaction_id"],
				},
				{
					name: "idx_airwallex_card_transactions_webhook_event_id",
					fields: ["webhook_event_id"],
				},
				{
					name: "idx_airwallex_card_transactions_charge_id",
					fields: ["charge_id"],
				}
			],
		},
	);

	return AirwallexCardTransactions;
}
