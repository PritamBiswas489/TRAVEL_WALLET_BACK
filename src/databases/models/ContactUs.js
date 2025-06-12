export default function ContactUs(sequelize, DataTypes) {
	return sequelize.define(
		'ContactUs',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
            address: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
            phoneOne: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
            phoneTwo: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
            email: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
            website: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			underscored: true,
			tableName: 'contact_us', 
		}
	);
}
