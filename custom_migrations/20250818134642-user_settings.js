export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("user_settings", {
    id:{
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true,
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

export async function down(queryInterface, Sequelize) {
   await queryInterface.dropTable("user_settings", {
    supportsSearchPath: false,
  });
   
}
