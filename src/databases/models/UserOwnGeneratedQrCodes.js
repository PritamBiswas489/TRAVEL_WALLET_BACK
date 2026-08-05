export default function UserOwnGeneratedQrCodes(sequelize, DataTypes) {
	const UserOwnGeneratedQrCodes = sequelize.define(
		"UserOwnGeneratedQrCodes",
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
			paymentUrl: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			token: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			amount: {
				type: DataTypes.DECIMAL(20, 2),
				allowNull: true,
			},
			currency: {
				type: DataTypes.STRING,
				allowNull: true,
				defaultValue: "ILS",
			},
			amountType: {
				type: DataTypes.STRING,
				allowNull: true,
				defaultValue: "open",
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: "OPEN",
			},
		},
		{
			tableName: "user_own_generated_qr_codes",
			timestamps: true,
		}
	);

	return UserOwnGeneratedQrCodes;
}
