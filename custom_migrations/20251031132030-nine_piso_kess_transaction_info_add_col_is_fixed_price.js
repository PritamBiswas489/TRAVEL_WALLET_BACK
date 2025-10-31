export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "ninepay_transaction_infos",
    "is_fixed_price",
    {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    {
      supportsSearchPath: false,
    }
  );

  await queryInterface.addColumn(
    "pisopy_transaction_infos",
    "is_fixed_price",
    {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    {
      supportsSearchPath: false,
    }
  );

  await queryInterface.addColumn(
    "kesspay_transaction_infos",
    "is_fixed_price",
    {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    {
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn(
    "ninepay_transaction_infos",
    "is_fixed_price",
    { supportsSearchPath: false }
  );
  await queryInterface.removeColumn(
    "pisopy_transaction_infos",
    "is_fixed_price",
    { supportsSearchPath: false }
  );
  await queryInterface.removeColumn(
    "kesspay_transaction_infos",
    "is_fixed_price",
    { supportsSearchPath: false }
  );
}
