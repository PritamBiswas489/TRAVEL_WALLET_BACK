export async function up(queryInterface, Sequelize) {
  console.log("🟢 Migration running: create-user-kyc");

  await queryInterface.createTable(
    "user_kyc",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
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
      applicantId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nationalId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      kycData: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "Document_pending",
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
    }
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("user_kyc", {
    supportsSearchPath: false,
  });
}
