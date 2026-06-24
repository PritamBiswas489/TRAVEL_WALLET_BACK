export default function AirwallexCardholder(sequelize, DataTypes) {
	const AirwallexCardholder = sequelize.define(
		'AirwallexCardholder',
		{
			id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			userId: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			cardholderId: {
				type: DataTypes.UUID,
				allowNull: false,
				unique: true,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			mobileNumber: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			individualFirstName: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			individualLastName: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			individualNameOnCard: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			individualDateOfBirth: {
				type: DataTypes.DATEONLY,
				allowNull: true,
			},
			individualAddressCity: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			individualAddressCountry: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			individualAddressLine1: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			individualAddressPostcode: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			individualAddressState: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			tableName: 'airwallex_card_holders',
			timestamps: true,
		},
	);

	return AirwallexCardholder;
}
