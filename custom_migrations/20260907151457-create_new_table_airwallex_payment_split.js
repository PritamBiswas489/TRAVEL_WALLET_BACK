export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "airwallex_payment_split",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      airwallexSplitId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      requestId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sourceId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sourceType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
      },
      destination: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      autoRelease: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      rawPayload: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      airwallexCreatedAt: {
        type: Sequelize.DATE,
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

  await queryInterface.addIndex("airwallex_payment_split", ["paymentId"], {
    name: "idx_airwallex_payment_split_paymentId",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_payment_split", {
    supportsSearchPath: false,
  });
}
