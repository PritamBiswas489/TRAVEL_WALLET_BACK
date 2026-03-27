'use strict';

export async function up(queryInterface, Sequelize) {
  // 1️⃣ Add columns
  await queryInterface.addColumn('thai_payments', 'created_month', {
    type: Sequelize.INTEGER,
    allowNull: true,
  });
  await queryInterface.addColumn('thai_payments', 'created_year', {
    type: Sequelize.INTEGER,
    allowNull: true,
  });

  // 2️⃣ Populate existing rows
  await queryInterface.sequelize.query(`
    UPDATE thai_payments
    SET created_month = EXTRACT(MONTH FROM "created_at")::INT,
        created_year = EXTRACT(YEAR FROM "created_at")::INT;
  `, { supportsSearchPath: false });

  // 3️⃣ Create trigger function
  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION set_created_month_year_thai()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.created_month := EXTRACT(MONTH FROM NEW."created_at")::INT;
      NEW.created_year := EXTRACT(YEAR FROM NEW."created_at")::INT;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `, { supportsSearchPath: false });

  // 4️⃣ Attach trigger
  await queryInterface.sequelize.query(`
    CREATE TRIGGER trg_thai_set_created_month_year
    BEFORE INSERT OR UPDATE ON thai_payments
    FOR EACH ROW EXECUTE FUNCTION set_created_month_year_thai();
  `, { supportsSearchPath: false });
}

export async function down(queryInterface, Sequelize) {
  // Drop trigger first
  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS trg_thai_set_created_month_year ON thai_payments;
  `, { supportsSearchPath: false });

  // Drop function
  await queryInterface.sequelize.query(`
    DROP FUNCTION IF EXISTS set_created_month_year_thai();
  `, { supportsSearchPath: false });

  // Remove columns
  await queryInterface.removeColumn('thai_payments', 'created_month');
  await queryInterface.removeColumn('thai_payments', 'created_year');
}
 