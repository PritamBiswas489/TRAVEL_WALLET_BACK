export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "airwallex_customer_offboarding_record",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      customerName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customerPhone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customerEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      apiId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      accountId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      supportsSearchPath: false,
    },
  );

  await queryInterface.addIndex(
    "airwallex_customer_offboarding_record",
    ["apiId"],
    { name: "idx_airwallex_customer_offboarding_record_apiId" },
  );
  await queryInterface.addIndex(
    "airwallex_customer_offboarding_record",
    ["accountId"],
    { name: "idx_airwallex_customer_offboarding_record_accountId" },
  );
  await queryInterface.addIndex(
    "airwallex_customer_offboarding_record",
    ["customerPhone"],
    { name: "idx_airwallex_customer_offboarding_record_customer_phone" },
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_customer_offboarding_record", {
    supportsSearchPath: false,
  });
}
