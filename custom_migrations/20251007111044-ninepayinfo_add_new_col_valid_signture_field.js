export async function up(queryInterface, Sequelize) {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.addColumn(
      'ninepay_transaction_infos',
      'is_valid_transfer_signature',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      { transaction, supportsSearchPath: false }
    );

    await queryInterface.addColumn(
      'ninepay_transaction_infos',
      'is_valid_callback_signature',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      { transaction, supportsSearchPath: false }
    );
  });
}

export async function down(queryInterface, Sequelize) {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeColumn(
      'ninepay_transaction_infos',
      'is_valid_transfer_signature',
      { transaction, supportsSearchPath: false }
    );

    await queryInterface.removeColumn(
      'ninepay_transaction_infos',
      'is_valid_callback_signature',
      { transaction, supportsSearchPath: false }
    );
  });
}