export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("airwallex_beneficiary_list", {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    main_id: {
      type: Sequelize.STRING,
      allowNull: true,
      field: "main_id",
    },
    userId: {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    nickname: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    entity_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    payer_entity_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    // Beneficiary info
    account_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    account_number: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    account_currency: {
      type: Sequelize.STRING(3),
      allowNull: true,
    },
    bank_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    bank_country_code: {
      type: Sequelize.STRING(2),
      allowNull: true,
    },
    swift_code: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // Address
    street_address: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    city: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    state: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    postcode: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    country_code: {
      type: Sequelize.STRING(2),
      allowNull: true,
    },
    // Personal info
    date_of_birth: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    personal_email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    // Transfer methods
    transfer_methods: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });

  await queryInterface.addIndex("airwallex_beneficiary_list", ["userId"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_beneficiary_list");
}
