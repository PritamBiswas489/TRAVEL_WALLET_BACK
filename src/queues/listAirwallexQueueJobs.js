import { airwallexQueue } from "../queues/airwallexPaymentIntent.queue.js";

const STATES = ["waiting", "active", "delayed", "completed", "failed", "paused"];

async function listAllJobs() {
  const counts = await airwallexQueue.getJobCounts(...STATES);
  console.log("📊 Job counts by state:", counts);
  console.log("─".repeat(60));

  for (const state of STATES) {
    const jobs = await airwallexQueue.getJobs([state], 0, 100); // first 100 per state
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

  process.exit(0);
}

listAllJobs().catch((err) => {
  console.error("❌ Failed to list jobs:", err);
  process.exit(1);
});
