export default function AirwallexPaymentIntent(sequelize, DataTypes) {
	const AirwallexPaymentIntent = sequelize.define(
		"AirwallexPaymentIntent",
		{
			id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			airwallexIntentId: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			merchantOrderId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			customerId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			requestId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			amount: {
				type: DataTypes.DECIMAL(20, 2),
				allowNull: true,
			},
            splitAmount: { 
                type: DataTypes.DECIMAL(20, 2),
                allowNull: true,
            },
			capturedAmount: {
				type: DataTypes.DECIMAL(20, 2),
				allowNull: true,
			},
			currency: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			baseAmount: {
				type: DataTypes.DECIMAL(20, 2),
				allowNull: true,
			},
			baseCurrency: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			descriptor: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			returnUrl: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			morEnabled: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			userId: {
				type: DataTypes.BIGINT,
				allowNull: true,
			},
			walletAccountId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			topupId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			transactionType: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			fundingType: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			transferBetweenOwnAccounts: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
			},
			recipientAccountNumber: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			recipientFirstName: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			recipientLastName: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			senderFirstName: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			senderLastName: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			metadata: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			additionalInfo: {
				type: DataTypes.JSONB,
				allowNull: true,
			},
			rawPayload: {
				type: DataTypes.JSONB,
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
		},
		{
			tableName: "airwallex_payment_intent",
			timestamps: true,
		}
	);

	return AirwallexPaymentIntent;
}
