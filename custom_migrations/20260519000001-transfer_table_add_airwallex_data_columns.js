export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    'transfer',
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
    'transfer',
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
  await queryInterface.removeColumn('transfer', 'airWallexWebhookData', {
    supportsSearchPath: false,
  });

  await queryInterface.removeColumn('transfer', 'airWallexSubmitData', {
    supportsSearchPath: false,
  });
}
