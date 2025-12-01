"use strict";

export async function up(queryInterface, Sequelize) {
  // ✅ Create the index using the persisted columns instead of EXTRACT
  await queryInterface.sequelize.query(`
    CREATE INDEX idx_userkyc_applicantid_uuid
    ON "user_kyc" ("applicantId", "uuid");
  `,{ supportsSearchPath: false });


  await queryInterface.sequelize.query(`
    CREATE INDEX idx_userkyc_uuid
    ON "user_kyc" ("uuid");
  `,{ supportsSearchPath: false });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS idx_userkyc_applicantid_uuid;
  `,{ supportsSearchPath: false });

  await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS idx_userkyc_uuid;
  `,{ supportsSearchPath: false });
}
