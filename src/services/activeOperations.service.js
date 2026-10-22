import redisClient from "../config/redis.config.js";

export const OP_TYPE = Object.freeze({
  PAYMENT: "payment",
  REFUND: "refund",
});

const OP_TTL = 24 * 60 * 60; // safety net only (24h)

export default class ActiveOperationService {
  static #key(userId, type) {
    if (!Object.values(OP_TYPE).includes(type)) {
      throw new Error(`Invalid operation type: ${type}`);
    }
    return `user:${userId}:active_ops:${type}`;
  }

  // returns true if newly added, false if this opId was already active
  static async start(userId, type, opId) {
    const key = ActiveOperationService.#key(userId, type);
    const results = await redisClient
      .multi()
      .sadd(key, opId)
      .expire(key, OP_TTL)
      .exec();
    return results[0][1] === 1; // results[0] = [err, value] of sadd
  }

  static touch(userId, type) {
    return redisClient.expire(
      ActiveOperationService.#key(userId, type),
      OP_TTL,
    );
  }

  static end(userId, type, opId) {
    return redisClient.srem(ActiveOperationService.#key(userId, type), opId);
  }

  static async isActive(userId, type, opId) {
    const key = ActiveOperationService.#key(userId, type);
    return (await redisClient.sismember(key, opId)) === 1;
  }

  static list(userId, type) {
    return redisClient.smembers(ActiveOperationService.#key(userId, type));
  }

  static async getCounts(userId) {
    const [payment, refund] = await Promise.all([
      redisClient.scard(ActiveOperationService.#key(userId, OP_TYPE.PAYMENT)),
      redisClient.scard(ActiveOperationService.#key(userId, OP_TYPE.REFUND)),
    ]);
    return { payment, refund, total: payment + refund };
  }

  // pass a type to check one, or omit it to check both
  static async hasActive(userId, type) {
    if (type) {
      return (
        (await redisClient.scard(ActiveOperationService.#key(userId, type))) > 0
      );
    }
    return (await ActiveOperationService.getCounts(userId)).total > 0;
  }
}
