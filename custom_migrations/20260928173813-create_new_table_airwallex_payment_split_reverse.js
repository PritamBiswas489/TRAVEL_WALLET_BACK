export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "airwallex_payment_split_reverse",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      requestId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      airwallexRevId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fundsSplitId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paymentId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "airwallex_payment_intent",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      supportsSearchPath: false,
    },
  );
  await queryInterface.addIndex("airwallex_payment_split_reverse", ["paymentId"], {
    name: "idx_airwallex_payment_reverse_split_paymentId",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex(
    "airwallex_payment_split_reverse",
    "idx_airwallex_payment_reverse_split_paymentId",
    {
      supportsSearchPath: false,
    },
  );

  await queryInterface.dropTable("airwallex_payment_split_reverse", {
    supportsSearchPath: false,
  });
}
