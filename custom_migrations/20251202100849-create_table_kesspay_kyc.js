export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "kesspay_kyc",
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
      userInfo:{
        type: Sequelize.JSONB,
        allowNull: true,
      },
      kessPayUserId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      kycStatus: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'PENDING'
      },
      kycResponseData:{
        type: Sequelize.JSONB,
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
  await queryInterface.dropTable("kesspay_kyc", {
    supportsSearchPath: false,
  });
}
