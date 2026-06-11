export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "thai_payments",
    "airwallex_tran_id",
    {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "airwallex_qr_code_transaction",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    {
      supportsSearchPath: false,
    }
  );

  await queryInterface.addIndex("thai_payments", ["airwallex_tran_id"], {
    name: "idx_thai_payments_airwallex_tran_id",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex("thai_payments", "idx_thai_payments_airwallex_tran_id");

  await queryInterface.removeColumn("thai_payments", "airwallex_tran_id", {
    supportsSearchPath: false,
  });
}
