export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("airwallex_payment_intent", "totalRefundAmount", {
    type: Sequelize.DECIMAL(20, 2),
    allowNull: true,
  });

  await queryInterface.addColumn("airwallex_payment_intent", "isCompleteRefund", {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  await queryInterface.addColumn("airwallex_payment_intent", "totalReverseSplitAmount", {
    type: Sequelize.DECIMAL(20, 2),
    allowNull: true,
  });

  await queryInterface.addColumn("airwallex_payment_intent", "isCompleteReverseSplit", {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  await queryInterface.addIndex(
    "airwallex_payment_intent",
    [
      "userId",
      "isCompleteReverseSplit",
      "isCompleteRefund",
      "totalReverseSplitAmount",
      "totalRefundAmount",
    ],
    { name: "idx_airwallex_payment_intent_refund_reverse_split_lookup" },
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex(
    "airwallex_payment_intent",
    "idx_airwallex_payment_intent_refund_reverse_split_lookup",
  );
  await queryInterface.removeColumn("airwallex_payment_intent", "isCompleteReverseSplit");
  await queryInterface.removeColumn("airwallex_payment_intent", "totalReverseSplitAmount");
  await queryInterface.removeColumn("airwallex_payment_intent", "isCompleteRefund");
  await queryInterface.removeColumn("airwallex_payment_intent", "totalRefundAmount");
}
