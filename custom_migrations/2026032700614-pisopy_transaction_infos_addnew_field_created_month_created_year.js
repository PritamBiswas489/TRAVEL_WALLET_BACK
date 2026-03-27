'use strict';

export async function up(queryInterface, Sequelize) {
  // 1️⃣ Add columns
  await queryInterface.addColumn('pisopy_transaction_infos', 'created_month', {
    type: Sequelize.INTEGER,
    allowNull: true,
  });
  await queryInterface.addColumn('pisopy_transaction_infos', 'created_year', {
    type: Sequelize.INTEGER,
    allowNull: true,
  });

  // 2️⃣ Populate existing rows
  await queryInterface.sequelize.query(`
    UPDATE pisopy_transaction_infos
    SET created_month = EXTRACT(MONTH FROM "createdAt")::INT,
        created_year = EXTRACT(YEAR FROM "createdAt")::INT;
  `, { supportsSearchPath: false });

  // 3️⃣ Create trigger function
  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION set_created_month_year()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.created_month := EXTRACT(MONTH FROM NEW."createdAt")::INT;
      NEW.created_year := EXTRACT(YEAR FROM NEW."createdAt")::INT;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `, { supportsSearchPath: false });

  // 4️⃣ Attach trigger
  await queryInterface.sequelize.query(`
    CREATE TRIGGER trg_set_created_month_year
    BEFORE INSERT OR UPDATE ON pisopy_transaction_infos
    FOR EACH ROW EXECUTE FUNCTION set_created_month_year();
  `, { supportsSearchPath: false });
}

export async function down(queryInterface, Sequelize) {
  // Drop trigger first
  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS trg_set_created_month_year ON pisopy_transaction_infos;
  `, { supportsSearchPath: false });

  // Drop function
  await queryInterface.sequelize.query(`
    DROP FUNCTION IF EXISTS set_created_month_year();
  `, { supportsSearchPath: false });

  // Remove columns
  await queryInterface.removeColumn('pisopy_transaction_infos', 'created_month');
  await queryInterface.removeColumn('pisopy_transaction_infos', 'created_year');
}
