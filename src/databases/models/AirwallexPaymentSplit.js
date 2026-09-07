export default function AirwallexPaymentSplit(sequelize, DataTypes) {
	const AirwallexPaymentSplit = sequelize.define(
		"AirwallexPaymentSplit",
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
			airwallexSplitId: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			requestId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			sourceId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			sourceType: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			currency: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			amount: {
				type: DataTypes.DECIMAL(20, 2),
				allowNull: true,
			},
			destination: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			autoRelease: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			metadata: {
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
		},
		{
			tableName: "airwallex_payment_split",
			timestamps: true,
		}
	);

	return AirwallexPaymentSplit;
}
