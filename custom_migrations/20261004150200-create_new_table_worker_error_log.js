export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("worker_error_logs", {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    queue: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING(32), // JOB_FAILED | WORKER_ERROR
      allowNull: false,
    },
    job_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    job_name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    attempt: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    attempts_allowed: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    exhausted: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    error_message: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    error_stack: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    job_data: {
      type: Sequelize.JSONB,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },{
     supportsSearchPath: false,
  });

  await queryInterface.addIndex("worker_error_logs", ["type"]);
  await queryInterface.addIndex("worker_error_logs", ["user_id"]);
  await queryInterface.addIndex("worker_error_logs", ["exhausted"]);
  await queryInterface.addIndex("worker_error_logs", ["created_at"]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("worker_error_logs",{
    supportsSearchPath: false,
  });
}