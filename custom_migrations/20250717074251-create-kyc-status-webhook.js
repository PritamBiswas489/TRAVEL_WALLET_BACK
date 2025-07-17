export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "kyc_status_webhook",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      applicantId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      inspectionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      applicantType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      correlationId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      levelName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      externalUserId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sandboxMode: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      reviewStatus: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAtMs: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      clientId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      applicantActionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      externalApplicantActionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reviewAnswer: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reviewRejectType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rejectLabels: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      buttonIds: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      rawPayload: {
        type: Sequelize.JSONB,
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
    }
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("kyc_status_webhook", {
    supportsSearchPath: false,
  });
}
