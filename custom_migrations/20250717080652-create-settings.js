export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("settings", {
    id:{
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: Sequelize.TEXT,
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
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("settings", {
    supportsSearchPath: false,
  });
}
