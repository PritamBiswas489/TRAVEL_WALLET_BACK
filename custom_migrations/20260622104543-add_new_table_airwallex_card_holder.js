export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('airwallex_card_holders', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    cardholderId: {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    mobileNumber: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    individualFirstName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    individualLastName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    individualNameOnCard: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    individualDateOfBirth: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    individualAddressCity: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    individualAddressCountry: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    individualAddressLine1: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    individualAddressPostcode: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    individualAddressState: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    supportsSearchPath: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('airwallex_card_holders', {
    supportsSearchPath: false,
  });
}
