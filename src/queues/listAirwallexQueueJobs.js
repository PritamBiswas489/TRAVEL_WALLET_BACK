import { airwallexQueue } from "../queues/airwallexPaymentIntent.queue.js";
import { airwallexUpdateTransactionQueue } from "../queues/airwallexTransactionUpdate.queue.js";

const STATES = ["waiting", "active", "delayed", "completed", "failed", "paused"];

const QUEUES = [
  { label: "airwallex-payment-intent", queue: airwallexQueue },
  { label: "airwallex-transaction-update", queue: airwallexUpdateTransactionQueue },
];

async function listQueueJobs(label, queue) {
  const counts = await queue.getJobCounts(...STATES);
  console.log(`\n📦 Queue: ${label}`);
  console.log("📊 Job counts by state:", counts);
  console.log("─".repeat(60));

  for (const state of STATES) {
    const jobs = await queue.getJobs([state], 0, 100); // first 100 per state
    if (jobs.length === 0) continue;

    console.log(`\n🔹 ${state.toUpperCase()} (${jobs.length})`);
    for (const job of jobs) {
      console.log({
        id: job.id,
        name: job.name,
        data: job.data,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason || null,
        timestamp: new Date(job.timestamp).toISOString(),
        processedOn: job.processedOn ? new Date(job.processedOn).toISOString() : null,
        finishedOn: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
      });
    }
  }
}

async function listAllJobs() {
  for (const { label, queue } of QUEUES) {
    await listQueueJobs(label, queue);
  }

  process.exit(0);
}

listAllJobs().catch((err) => {
  console.error("❌ Failed to list jobs:", err);
  process.exit(1);
});
