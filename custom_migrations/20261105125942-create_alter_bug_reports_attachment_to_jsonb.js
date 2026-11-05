export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    ALTER TABLE "bug_reports"
    ALTER COLUMN "attachment" TYPE JSONB
    USING CASE
      WHEN "attachment" IS NULL THEN NULL
      ELSE to_jsonb("attachment")
    END;
  `);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    ALTER TABLE "bug_reports"
    ALTER COLUMN "attachment" TYPE VARCHAR(255)
    USING CASE
      WHEN jsonb_typeof("attachment") = 'string' THEN "attachment" #>> '{}'
      ELSE "attachment"::text
    END;
  `);
}
