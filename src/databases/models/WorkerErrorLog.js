export default function WorkerErrorLogs(sequelize, DataTypes) {
	const WorkerErrorLogs = sequelize.define(
		"WorkerErrorLogs",
		{
			id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			queue: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING(32), // JOB_FAILED | WORKER_ERROR
				allowNull: false,
			},
			jobId: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "job_id",
			},
			jobName: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "job_name",
			},
			userId: {
				type: DataTypes.STRING,
				allowNull: true,
				field: "user_id",
			},
			attempt: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			attemptsAllowed: {
				type: DataTypes.INTEGER,
				allowNull: true,
				field: "attempts_allowed",
			},
			exhausted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			errorMessage: {
				type: DataTypes.TEXT,
				allowNull: true,
				field: "error_message",
			},
			errorStack: {
				type: DataTypes.TEXT,
				allowNull: true,
				field: "error_stack",
			},
			jobData: {
				type: DataTypes.JSONB,
				allowNull: true,
				field: "job_data",
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
				field: "created_at",
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
				field: "updated_at",
			},
		},
		{
			tableName: "worker_error_logs",
			timestamps: false,
			indexes: [
				{
					name: "idx_worker_error_logs_userId",
					fields: ["user_id"],
				},
				{
					name: "idx_worker_error_logs_type",
					fields: ["type"],
				},
				{
					name: "idx_worker_error_logs_exhausted",
					fields: ["exhausted"],
				},
				{
					name: "idx_worker_error_logs_createdAt",
					fields: ["created_at"],
				},
			],
		},
	);

	return WorkerErrorLogs;
}