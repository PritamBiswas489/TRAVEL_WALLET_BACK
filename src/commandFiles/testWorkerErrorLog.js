// Run from your project root:  node scripts/testWorkerErrorLog.js
// Add --cleanup to delete the test rows afterwards.

import "../config/environment.js";
import db from "../databases/models/index.js";
import WorkerErrorLogService from "../services/workerErrorLog.service.js";

const QUEUE = "test-queue";
const cleanup = process.argv.includes("--cleanup");

async function main() {
	// 1. Fake failed job (last attempt, so exhausted should be true)
	const fakeJob = {
		id: `test-${Date.now()}`,
		name: "TEST_JOB",
		attemptsMade: 3,
		opts: { attempts: 3 },
		data: { userId: 1, intentId: "test-intent", paymentId: 123 },
	};

	const jobRow = await WorkerErrorLogService.logJobFailure({
		queue: QUEUE,
		job: fakeJob,
		err: new Error("TEST: simulated job failure"),
	});
	console.log("logJobFailure ->", jobRow ? `saved id=${jobRow.id}` : "NOT SAVED");

	// 2. Fake worker-level error (unique message so throttle doesn't skip it)
	const workerRow = await WorkerErrorLogService.logWorkerError({
		queue: QUEUE,
		err: new Error(`TEST: simulated worker error ${Date.now()}`),
	});
	console.log("logWorkerError ->", workerRow ? `saved id=${workerRow.id}` : "NOT SAVED");

	// 3. Job undefined case (should not throw)
	const noJobRow = await WorkerErrorLogService.logJobFailure({
		queue: QUEUE,
		job: undefined,
		err: new Error("TEST: failed event without job"),
	});
	console.log("logJobFailure (no job) ->", noJobRow ? `saved id=${noJobRow.id}` : "NOT SAVED");

	// 4. Read back through the service
	const { logs, total } = await WorkerErrorLogService.getLogs({ limit: 5 });
	console.log(`\nLatest rows (total in table: ${total}):`);
	console.table(
		logs.map((l) => ({
			id: l.id,
			type: l.type,
			jobName: l.jobName,
			userId: l.userId,
			attempt: l.attempt,
			attemptsAllowed: l.attemptsAllowed,
			exhausted: l.exhausted,
			errorMessage: l.errorMessage,
		})),
	);

	if (cleanup) {
		const deleted = await db.WorkerErrorLogs.destroy({ where: { queue: QUEUE } });
		console.log(`Cleanup: deleted ${deleted} test row(s)`);
	}
}

main()
	.catch((e) => {
		console.error("Test script failed:", e);
		process.exitCode = 1;
	})
	.finally(() => process.exit());
