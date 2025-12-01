"use strict";

export async function up(queryInterface, Sequelize) {
  // ✅ Create the index using the persisted columns instead of EXTRACT
  await queryInterface.sequelize.query(`
    CREATE INDEX idx_kyc_docs_user_applicant_inspection
    ON "kyc_verified_documents" ("userId", "applicantId", "inspectionId");
  `,{ supportsSearchPath: false });


  await queryInterface.sequelize.query(`
   CREATE INDEX idx_kyc_docs_applicantid
   ON "kyc_verified_documents" ("applicantId");
  `,{ supportsSearchPath: false });


  await queryInterface.sequelize.query(`
   CREATE INDEX idx_kyc_docs_inspectionid
   ON "kyc_verified_documents" ("inspectionId");
  `,{ supportsSearchPath: false });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS idx_kyc_docs_user_applicant_inspection;
  `,{ supportsSearchPath: false });

  await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS idx_kyc_docs_applicantid;
  `,{ supportsSearchPath: false });

   await queryInterface.sequelize.query(`
    DROP INDEX IF EXISTS idx_kyc_docs_inspectionid;
  `,{ supportsSearchPath: false });
}
