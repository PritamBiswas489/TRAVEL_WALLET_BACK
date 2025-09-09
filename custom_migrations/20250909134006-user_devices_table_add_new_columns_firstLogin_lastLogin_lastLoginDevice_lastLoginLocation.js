export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "user_devices",
    "firstLoggedIn",
    {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    {
      supportsSearchPath: false,
    }
  );

  await queryInterface.addColumn(
    "user_devices",
    "lastLoggedIn",
    {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    {
      supportsSearchPath: false,
    }
  );

  await queryInterface.addColumn(
    "user_devices",
    "lastLoggedInLocation",
    {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    {
      supportsSearchPath: false,
    }
  );

  await queryInterface.addColumn(
    "user_devices",
    "deviceType",
    {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    {
      supportsSearchPath: false,
    }
  );
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("user_devices", "firstLoggedIn", {
    supportsSearchPath: false,
  });

  await queryInterface.removeColumn("user_devices", "lastLoggedIn", {
    supportsSearchPath: false,
  });

  await queryInterface.removeColumn("user_devices", "lastLoggedInLocation", {
    supportsSearchPath: false,
  });
}
