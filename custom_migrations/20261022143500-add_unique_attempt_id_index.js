const tableName = "airwallex_payment_attempt_records";
const indexName = "airwallex_payment_attempt_records_attempt_id_unique";

async function getTableNames(queryInterface) {
  const tables = await queryInterface.showAllTables();
  return tables.map((table) =>
    typeof table === "string" ? table : table.tableName,
  );
}

export async function up(queryInterface, Sequelize) {
  const tableNames = await getTableNames(queryInterface);
  if (!tableNames.includes(tableName)) {
    const { up: createPaymentAttemptRecordsTable } = await import(
      "./20261022080300-create_new_table_airwallex_payment_attempt_records.js"
    );
    await createPaymentAttemptRecordsTable(queryInterface, Sequelize);
    return;
  }

  const indexes = await queryInterface.showIndex(tableName);
  const hasUniqueAttemptIdIndex = indexes.some(
    (index) =>
      index.unique &&
      index.fields.some(
        (field) =>
          field.attribute === "attemptId" || field.name === "attemptId",
      ),
  );
  if (!hasUniqueAttemptIdIndex) {
    await queryInterface.addIndex(tableName, ["attemptId"], {
      name: indexName,
      unique: true,
    });
  }
}

export async function down(queryInterface) {
  const tableNames = await getTableNames(queryInterface);
  if (!tableNames.includes(tableName)) return;

  const indexes = await queryInterface.showIndex(tableName);
  if (indexes.some((index) => index.name === indexName)) {
    await queryInterface.removeIndex(tableName, indexName);
  }
}
