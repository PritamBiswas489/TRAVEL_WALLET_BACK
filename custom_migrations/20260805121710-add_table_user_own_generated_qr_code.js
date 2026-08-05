export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "user_own_generated_qr_codes",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      paymentUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "ILS",
      },
      amountType: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "open",
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "OPEN",
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
    }
  );

  await queryInterface.addIndex("user_own_generated_qr_codes", ["userId"], {
    name: "idx_user_own_generated_qr_codes_userId",
  });

  await queryInterface.addIndex("user_own_generated_qr_codes", ["token"], {
    name: "idx_user_own_generated_qr_codes_token",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("user_own_generated_qr_codes", {
    supportsSearchPath: false,
  });
}
