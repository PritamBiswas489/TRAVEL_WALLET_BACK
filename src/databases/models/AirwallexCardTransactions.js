export default function AirwallexCardTransactions(sequelize, DataTypes) {
	const AirwallexCardTransactions = sequelize.define(
		"AirwallexCardTransactions",
		{
			id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			acquiringInstitutionIdentifier: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			userId: {
				type: DataTypes.BIGINT,
				allowNull: true,
				field: "user_id",
			},
			authCode: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			billingAmount: {
				type: DataTypes.DECIMAL(20, 8),
				allowNull: true,
			},
			billingCurrency: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			cardId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			cardNickname: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			cardTransactionEventId: {
				type: DataTypes.STRING,
				allowNull: true,
				unique: true,
			},
			cardTransactionId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			cardTransactionLifecycleId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			lifecycleId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			maskedCardNumber: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			merchantCategoryCode: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			merchantCity: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			merchantCountry: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			merchantIdentifier: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			merchantName: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			merchantCategory: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			merchantSubCategory: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			networkTransactionId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			postedDate: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			retrievalRef: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			riskActionsPerformed: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			riskFactors: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			threeDSecureOutcome: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			transactionAmount: {
				type: DataTypes.DECIMAL(20, 8),
				allowNull: true,
			},
			transactionCurrency: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			transactionDate: {
				type: DataTypes.DATE,
				allowNull: true,
			},
			transactionId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			transactionType: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			rawPayload: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
		},
		{
			tableName: "airwallex_card_transactions",
			timestamps: true,
			indexes: [
				{
					name: "uniq_airwallex_card_transactions_cardTransactionEventId",
					unique: true,
					fields: ["cardTransactionEventId"],
				},
				{
					name: "idx_airwallex_card_transactions_transactionId",
					fields: ["transactionId"],
				},
				{
					name: "idx_airwallex_card_transactions_cardId",
					fields: ["cardId"],
				},
				{
					name: "idx_airwallex_card_transactions_user_id",
					fields: ["user_id"],
				},
				{
					name: "idx_airwallex_card_transactions_status_transactionDate",
					fields: ["status", "transactionDate"],
				},
			],
		},
	);

	return AirwallexCardTransactions;
}
