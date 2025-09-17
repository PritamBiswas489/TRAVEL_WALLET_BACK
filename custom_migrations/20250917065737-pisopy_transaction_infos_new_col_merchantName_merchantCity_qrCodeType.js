export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "pisopy_transaction_infos",
    "merchantName",
    {
      type: Sequelize.STRING,
      allowNull: true,
    },
    {
      supportsSearchPath: false,
    }
  );
   await queryInterface.addColumn(
    "pisopy_transaction_infos",
    "merchantCity",
    {
      type: Sequelize.STRING,
      allowNull: true,
    },
    {
      supportsSearchPath: false,
    }
  );
   await queryInterface.addColumn(
    "pisopy_transaction_infos",
    "qrCodeType",
    {
      type: Sequelize.STRING,
      allowNull: true,
    },
    {
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("pisopy_transaction_infos", "merchantName", {
      supportsSearchPath: false,
    });
    await queryInterface.removeColumn("pisopy_transaction_infos", "merchantCity", {
      supportsSearchPath: false,
    });
    await queryInterface.removeColumn("pisopy_transaction_infos", "qrCodeType", {
      supportsSearchPath: false,
    });
}
