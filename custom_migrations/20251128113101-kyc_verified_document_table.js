export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "kyc_verified_documents",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      applicantId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      inspectionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      documentData:{
        type: Sequelize.JSONB,
        allowNull: true,
      },
      documentFiles:{
        type: Sequelize.JSONB,
        allowNull: true,
      },
      kessPaySenderId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },

    {
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("kyc_verified_documents", {
    supportsSearchPath: false,
  });
}
