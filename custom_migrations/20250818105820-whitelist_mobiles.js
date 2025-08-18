export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "whitelist_mobiles",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      displayName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mobileNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      formattedNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      hasThumbnail: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      thumbnailPath: {
        type: Sequelize.STRING,
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

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable("whitelist_mobiles", {
    supportsSearchPath: false,
  });
}
