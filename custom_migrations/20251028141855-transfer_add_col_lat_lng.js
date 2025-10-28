export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "transfer",
    "senderLatitude",
    {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    {
      supportsSearchPath: false,
    }
  );

  await queryInterface.addColumn(
    "transfer",
    "senderLongitude",
    {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    {
      supportsSearchPath: false,
    }
  );



    await queryInterface.addColumn(
    "transfer",
    "receiverLatitude",
    {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    {
      supportsSearchPath: false,
    }
  );

  await queryInterface.addColumn(
    "transfer",
    "receiverLongitude",
    {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    {
      supportsSearchPath: false,
    }
  );

  
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("transfer", "senderLatitude", {
    supportsSearchPath: false,
  });
  await queryInterface.removeColumn("transfer", "senderLongitude", {
    supportsSearchPath: false,
  });


  await queryInterface.removeColumn("transfer", "receiverLongitude", {
    supportsSearchPath: false,
  });
  await queryInterface.removeColumn("transfer", "receiverLatitude", {
    supportsSearchPath: false,
  });
}
