export default function AirwallexUserDebitCards(sequelize, DataTypes) {
	const AirwallexUserDebitCards = sequelize.define(
		'AirwallexUserDebitCards',
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
			brand: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			cardId: {
				type: DataTypes.UUID,
				allowNull: false,
				unique: true,
			},
			cardNumber: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			cardStatus: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			cardDesignType: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			cardDesignPresetId: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			cardDesignBackground: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			cardholderId: {
				type: DataTypes.UUID,
				allowNull: false,
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
			tableName: 'airwallex_user_debit_cards',
			timestamps: true,
		},
	);

	return AirwallexUserDebitCards;
}
