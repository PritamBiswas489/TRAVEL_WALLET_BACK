"use strict";

export async function up(queryInterface, Sequelize) {
  // ✅ Create the index using the persisted columns instead of EXTRACT
  await queryInterface.sequelize.query(`
    CREATE INDEX idx_ninepay_user_success_month_year
    ON ninepay_transaction_infos (
      "userId",
      created_month,
      created_year,
      "expenseCatId"
    )
    WHERE status = 'SUCCESS';
  `,{ supportsSearchPath: false });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS idx_ninepay_user_success_month_year;
  `,{ supportsSearchPath: false });
}
