export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn(
    "suggestions",
    "tkt_id",
    {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    {
      supportsSearchPath: false,
    },
  );

  await queryInterface.addIndex("suggestions", ["tkt_id"], {
    name: "suggestions_tkt_id",
    supportsSearchPath: false,
  });

  await queryInterface.addColumn(
    "bug_reports",
    "tkt_id",
    {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    {
      supportsSearchPath: false,
    },
  );

  await queryInterface.addIndex("bug_reports", ["tkt_id"], {
    name: "bug_reports_tkt_id",
    supportsSearchPath: false,
  });

  await queryInterface.addColumn(
    "bug_reports",
    "isBlocking",
    {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    {
      supportsSearchPath: false,
    },
  );
}

export async function down(queryInterface, Sequelize) {
  for (const [table, indexName] of [
    ["suggestions", "suggestions_tkt_id"],
    ["bug_reports", "bug_reports_tkt_id"],
  ]) {
    const indexes = await queryInterface.showIndex(table, {
      supportsSearchPath: false,
    });
    if (indexes.some(({ name }) => name === indexName)) {
      await queryInterface.removeIndex(table, indexName, {
        supportsSearchPath: false,
      });
    }

    const columns = await queryInterface.describeTable(table, {
      supportsSearchPath: false,
    });
    if (Object.prototype.hasOwnProperty.call(columns, "tkt_id")) {
      await queryInterface.removeColumn(table, "tkt_id", {
        supportsSearchPath: false,
      });
    }
  }
  await queryInterface.removeColumn("bug_reports", "isBlocking");
}
