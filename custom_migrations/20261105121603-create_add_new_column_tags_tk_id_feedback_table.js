export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "feedbacks",
    "tags",
    {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    {
      supportsSearchPath: false,
    }
  );
  await queryInterface.addColumn(
    "feedbacks",
    "tkt_id",
    {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    {
      supportsSearchPath: false,
    }
  );
  await queryInterface.addIndex("feedbacks", ["tkt_id"], {
    name: "feedbacks_tkt_id",
    supportsSearchPath: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeIndex("feedbacks", "feedbacks_tkt_id", {
    supportsSearchPath: false,
  });
  await queryInterface.removeColumn("feedbacks", "tkt_id", {
    supportsSearchPath: false,
  });
  await queryInterface.removeColumn("feedbacks", "tags", {
    supportsSearchPath: false,
  });
}
