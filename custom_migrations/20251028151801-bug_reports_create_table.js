export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "bug_reports",
    {
      id: {
        type: Sequelize.INTEGER,
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
        onDelete: "SET NULL",
      },
      severityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "bug_severity",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      placeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "bug_place",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      bugDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      bugReproduce: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      deviceInformation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      attachment: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      
      status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "new",
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("bug_reports", {
    supportsSearchPath: false,
  });
}
