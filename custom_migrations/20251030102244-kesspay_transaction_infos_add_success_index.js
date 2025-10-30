"use strict";

export async function up(queryInterface, Sequelize) {
  // ✅ Create the index using the persisted columns instead of EXTRACT
  await queryInterface.sequelize.query(`
    CREATE INDEX idx_kesspay_user_success_month_year
    ON kesspay_transaction_infos (
      "userId",
      created_month,
      created_year,
      "expenseCatId"
    )
    WHERE transaction_status = 'SUCCEEDED';
  `,{ supportsSearchPath: false });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS idx_kesspay_user_success_month_year;
  `,{ supportsSearchPath: false });
}
