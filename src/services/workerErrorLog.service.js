import "../config/environment.js";
import db from "../databases/models/index.js";

const { WorkerErrorLogs, Op } = db;

const LOG_TYPES = Object.freeze({
	JOB_FAILED: "JOB_FAILED",
	WORKER_ERROR: "WORKER_ERROR",
	STALLED_JOB: "STALLED_JOB",
});

// Redis outages can emit the same "error" event repeatedly.
// Skip writing the same message again within this window.
const WORKER_ERROR_THROTTLE_MS = 60 * 1000;

class WorkerErrorLogService {
  static LOG_TYPES = LOG_TYPES;

  // message -> last time it was saved (in-memory, per process)
  static #recentWorkerErrors = new Map();

  /**
   * Save a failed job attempt. Never throws, so logging can't crash the worker.
   */
  static async logJobFailure({ queue, job, err }) {
    const attemptsAllowed = job?.opts?.attempts ?? 1;
    const attempt = job?.attemptsMade ?? 0;

    return this.#safeCreate({
      queue,
      type: LOG_TYPES.JOB_FAILED,
      jobId: job?.id != null ? String(job.id) : null,
      jobName: job?.name ?? null,
      userId: job?.data?.userId ?? null,
      attempt,
      attemptsAllowed,
      exhausted: attempt >= attemptsAllowed,
      errorMessage: err?.message || String(err),
      errorStack: err?.stack ?? null,
      jobData: job?.data ?? null,
    });
  }

  /**
   * Save a worker/connection-level error (e.g. Redis dropped).
   * Throttled per unique message. Never throws.
   */
  static async logWorkerError({ queue, err }) {
    const message = err?.message || String(err);
    const now = Date.now();
    const last = this.#recentWorkerErrors.get(message);

    if (last && now - last < WORKER_ERROR_THROTTLE_MS) return null;
    this.#recentWorkerErrors.set(message, now);

    // Keep the map from growing forever
    if (this.#recentWorkerErrors.size > 200) {
      for (const [key, ts] of this.#recentWorkerErrors) {
        if (now - ts >= WORKER_ERROR_THROTTLE_MS) {
          this.#recentWorkerErrors.delete(key);
        }
      }
    }

    return this.#safeCreate({
      queue,
      type: LOG_TYPES.WORKER_ERROR,
      errorMessage: message,
      errorStack: err?.stack ?? null,
    });
  }

  /**
   * Save a stalled job (worker died or lost its lock mid-processing).
   * BullMQ only gives us the job id here, so we look the job up for details.
   * Not throttled: each stalled job is its own event. Never throws.
   */
  static async logStalledJob({ queue, jobId, queueInstance }) {
    let job = null;
    try {
      // queueInstance is optional: a BullMQ Queue object used to fetch job details
      job = (await queueInstance?.getJob(jobId)) ?? null;
    } catch (_) {
      // job may already be gone; log with just the id
    }

    return this.#safeCreate({
      queue,
      type: LOG_TYPES.STALLED_JOB,
      jobId: jobId != null ? String(jobId) : null,
      jobName: job?.name ?? null,
      userId: job?.data?.userId ?? null,
      attempt: job?.attemptsMade ?? null,
      attemptsAllowed: job?.opts?.attempts ?? null,
      exhausted: false,
      errorMessage:
        "Job stalled (worker lost the lock or crashed mid-processing)",
      jobData: job?.data ?? null,
    });
  }

  /**
   * Paginated search for an admin screen or debugging.
   */
  static async getLogs({
    userId,
    type,
    exhausted,
    jobName,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
  } = {}) {
    const where = {};
    if (userId != null) where.userId = userId;
    if (type) where.type = type;
    if (typeof exhausted === "boolean") where.exhausted = exhausted;
    if (jobName) where.jobName = jobName;

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
      if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);

    const { rows, count } = await WorkerErrorLogs.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: safeLimit,
      offset: (safePage - 1) * safeLimit,
    });

    return {
      logs: rows,
      total: count,
      page: safePage,
      totalPages: Math.ceil(count / safeLimit),
    };
  }

  /**
   * Delete logs older than N days. Run from a scheduled/repeatable job.
   * Returns the number of deleted rows.
   */
  static async deleteOlderThan(days = 30) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return WorkerErrorLogs.destroy({
      where: { createdAt: { [Op.lt]: cutoff } },
    });
  }

  static async #safeCreate(payload) {
    try {
      return await WorkerErrorLogs.create(payload);
    } catch (dbErr) {
      console.error(
        "❌ Failed to save worker error log:",
        dbErr?.message || dbErr,
      );
      return null;
    }
  }
}

export default WorkerErrorLogService;
