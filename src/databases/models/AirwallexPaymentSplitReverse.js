export default function AirwallexPaymentSplitReverse(sequelize, DataTypes) {
	const AirwallexPaymentSplitReverse = sequelize.define(
		"AirwallexPaymentSplitReverse",
		{
			id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			requestId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			airwallexRevId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			fundsSplitId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			paymentId: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			amount: {
				type: DataTypes.DECIMAL(20, 2),
				allowNull: true,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			tableName: "airwallex_payment_split_reverse",
			timestamps: true,
			indexes: [
				{
					name: "idx_airwallex_payment_reverse_split_paymentId",
					fields: ["paymentId"],
				},
			],
		}
	);

	return AirwallexPaymentSplitReverse;
}
