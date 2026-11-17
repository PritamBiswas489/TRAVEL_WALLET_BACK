export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("airwallex_card_transactions", "billing_usage_amt", {
    type: Sequelize.DECIMAL(18, 2),
    allowNull: true,
  });

  await queryInterface.addColumn("airwallex_card_transactions", "billing_wallet_cur", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn("airwallex_card_transactions", "billing_charge_percentage", {
    type: Sequelize.DECIMAL(5, 2),
    allowNull: true,
  });

  await queryInterface.addColumn("airwallex_card_transactions", "billing_charged_amount", {
    type: Sequelize.DECIMAL(18, 2),
    allowNull: true,
  });

  await queryInterface.addColumn("airwallex_card_transactions", "billing_total", {
    type: Sequelize.DECIMAL(18, 2),
    allowNull: true,
  });

  await queryInterface.addColumn("airwallex_card_transactions", "charge_status", {
    type: Sequelize.STRING,
    allowNull: true,
  });

  await queryInterface.addColumn("airwallex_card_transactions", "charge_payment_logs", {
    type: Sequelize.JSONB,
    allowNull: true,
  });

   await queryInterface.addColumn("airwallex_card_transactions", "charge_payment_webhooks", {
    type: Sequelize.JSONB,
    allowNull: true,
  });

  await queryInterface.addColumn("airwallex_card_transactions", "charge_id", {
    type: Sequelize.UUID,
    allowNull: true,
  });

  await queryInterface.addIndex("airwallex_card_transactions", ["charge_id"], {
    name: "idx_airwallex_card_transactions_charge_id",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex("airwallex_card_transactions", "idx_airwallex_card_transactions_charge_id");
  await queryInterface.removeColumn("airwallex_card_transactions", "charge_id");
  await queryInterface.removeColumn("airwallex_card_transactions", "billing_usage_amt");
  await queryInterface.removeColumn("airwallex_card_transactions", "billing_wallet_cur");
  await queryInterface.removeColumn("airwallex_card_transactions", "billing_charge_percentage");
  await queryInterface.removeColumn("airwallex_card_transactions", "billing_charged_amount");
  await queryInterface.removeColumn("airwallex_card_transactions", "billing_total");
  await queryInterface.removeColumn("airwallex_card_transactions", "charge_status");
  await queryInterface.removeColumn("airwallex_card_transactions", "charge_payment_logs");
  await queryInterface.removeColumn("airwallex_card_transactions", "charge_payment_webhooks");
}
