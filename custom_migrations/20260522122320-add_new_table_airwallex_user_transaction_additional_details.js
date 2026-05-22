export async function up(queryInterface, Sequelize) {
  // TODO: create table
  await queryInterface.createTable(
    "airwallex_user_transaction_additional_details",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      sourceId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      appTransactionType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      description_he: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      jsonData: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      supportsSearchPath: false,
    },
  );

  await queryInterface.addIndex('airwallex_user_transaction_additional_details', ['sourceId'], {
    name: 'idx_airwallex_user_transaction_additional_details_sourceId',
  });

  await queryInterface.addIndex('airwallex_user_transaction_additional_details', ['appTransactionType'], {
    name: 'idx_airwallex_user_transaction_additional_details_appTransactionType',
  });
}

export async function down(queryInterface, Sequelize) {
  // TODO: drop table
  await queryInterface.dropTable("airwallex_user_transaction_additional_details", {
    supportsSearchPath: false,
  });
}
