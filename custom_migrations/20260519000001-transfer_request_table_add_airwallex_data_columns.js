export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    'transfer_requests',
    'airWallexSubmitData',
    {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    {
      supportsSearchPath: false,
    }
  );

  await queryInterface.addColumn(
    'transfer_requests',
    'airWallexWebhookData',
    {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    {
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('transfer_requests', 'airWallexWebhookData', {
    supportsSearchPath: false,
  });

  await queryInterface.removeColumn('transfer_requests', 'airWallexSubmitData', {
    supportsSearchPath: false,
  });
}
