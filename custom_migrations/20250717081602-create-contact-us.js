export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("contact_us", {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    phoneOne: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    phoneTwo: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    email: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    website: {
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
  await queryInterface.dropTable("contact_us", {
    supportsSearchPath: false,
  });
}
