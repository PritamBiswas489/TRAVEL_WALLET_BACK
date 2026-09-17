export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('airwallex_payment_intent', 'recharge_status', {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
    after: 'status',
  });

  await queryInterface.addColumn('airwallex_payment_intent', 'refund_recharge_status', {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
    after: 'recharge_status',
  });

  await queryInterface.addColumn('airwallex_payment_intent', 'payment_refund_status', {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
    after: 'refund_recharge_status',
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('airwallex_payment_intent', 'payment_refund_status');
  await queryInterface.removeColumn('airwallex_payment_intent', 'refund_recharge_status');
  await queryInterface.removeColumn('airwallex_payment_intent', 'recharge_status');
}
