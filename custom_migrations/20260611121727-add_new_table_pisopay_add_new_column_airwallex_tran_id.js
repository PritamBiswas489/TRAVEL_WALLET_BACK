export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "pisopy_transaction_infos",
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

  await queryInterface.addIndex("pisopy_transaction_infos", ["airwallex_tran_id"], {
    name: "idx_pisopy_transaction_infos_airwallex_tran_id",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex("pisopy_transaction_infos", "idx_pisopy_transaction_infos_airwallex_tran_id");

  await queryInterface.removeColumn("pisopy_transaction_infos", "airwallex_tran_id", {
    supportsSearchPath: false,
  });
}
