export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
   "transfer_requests",
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
   "transfer_requests",
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
   "transfer_requests",
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
   "transfer_requests",
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
  await queryInterface.removeColumn("transfer_requests", "senderLatitude", {
    supportsSearchPath: false,
  });
  await queryInterface.removeColumn("transfer_requests", "senderLongitude", {
    supportsSearchPath: false,
  });


  await queryInterface.removeColumn("transfer_requests", "receiverLongitude", {
    supportsSearchPath: false,
  });
  await queryInterface.removeColumn("transfer_requests", "receiverLatitude", {
    supportsSearchPath: false,
  });
}
