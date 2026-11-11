export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "controlled_profiles",
    {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      name: {
        type: Sequelize.STRING(100),
      },
      profile_type: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      balance_visibility: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      spending_limits: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      permissions: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      mobile_device_details: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      activation_code_hash: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: true,
      },
    },
    {
      supportsSearchPath: false,
    },
  );

  await queryInterface.addIndex(
    "controlled_profiles",
    ["userId", "activation_code_hash"],
    {
      unique: true,
      name: "controlled_profiles_userId_activation_code_hash_unique",
    },
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("controlled_profiles", {
    supportsSearchPath: false,
  });
}
