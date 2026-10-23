import { airwallexQueue } from "../queues/airwallexPaymentIntent.queue.js";
import { airwallexUpdateTransactionQueue } from "../queues/airwallexTransactionUpdate.queue.js";
import { airwallexRefundQueue } from "../queues/airwallexRefund.queue.js";
import { pushNotificationQueue } from "./pushNotification.queue.js";

const ALL_STATES = ["waiting", "active", "delayed", "completed", "failed", "paused"];

const QUEUES = {
  "payment-intent": airwallexQueue,
  "transaction-update": airwallexUpdateTransactionQueue,
  "refund": airwallexRefundQueue,
  "push-notification": pushNotificationQueue,
};

// Usage:
//   node listJobs.js                          -> all queues
//   node listJobs.js refund                   -> only refund queue
//   node listJobs.js refund failed            -> only failed jobs in refund queue
//   node listJobs.js refund failed,waiting    -> multiple states
const [queueArg, stateArg] = process.argv.slice(2);

function printUsage() {
  console.log("Usage: node listJobs.js [queue] [states]");
  console.log("Queues:", Object.keys(QUEUES).join(", "));
  console.log("States:", ALL_STATES.join(", "));
}

async function listQueueJobs(label, queue, states) {
  const counts = await queue.getJobCounts(...ALL_STATES);
  console.log(`\n📦 Queue: ${label}`);
  console.log("📊 Job counts by state:", counts);
  console.log("─".repeat(60));

  for (const state of states) {
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

async function main() {
  if (queueArg === "--help" || queueArg === "-h") {
    printUsage();
    return;
  }

  // Pick queues
  let selected = Object.entries(QUEUES);
  if (queueArg) {
    const queue = QUEUES[queueArg];
    if (!queue) {
      console.error(`❌ Unknown queue: "${queueArg}"`);
      printUsage();
      process.exit(1);
    }
    selected = [[queueArg, queue]];
  }

  // Pick states
  let states = ALL_STATES;
  if (stateArg) {
    states = stateArg.split(",").map((s) => s.trim());
    const invalid = states.filter((s) => !ALL_STATES.includes(s));
    if (invalid.length) {
      console.error(`❌ Invalid state(s): ${invalid.join(", ")}`);
      printUsage();
      process.exit(1);
    }
  }

  for (const [label, queue] of selected) {
    await listQueueJobs(label, queue, states);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Failed to list jobs:", err);
    process.exit(1);
  });