export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "airwallex_user_debit_cards",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cardId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      cardNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cardStatus: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cardholderId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      airwallexCreatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      airwallexUpdatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      supportsSearchPath: false,
    },
  );

  await queryInterface.addIndex("airwallex_user_debit_cards", ["cardholderId"], {
    name: "idx_airwallex_user_debit_cards_cardholderId",
  });

  await queryInterface.addIndex("airwallex_user_debit_cards", ["userId", "cardStatus"], {
    name: "idx_airwallex_user_debit_cards_userId_cardStatus",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("airwallex_user_debit_cards", {
    supportsSearchPath: false,
  });
}
