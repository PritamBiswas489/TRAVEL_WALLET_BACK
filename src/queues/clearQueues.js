import Redis from 'ioredis';
const redis = new Redis();

// Get the queue name from the terminal command arguments
const queueName = process.argv[2];

async function clearRedisData() {
  try {
    if (!queueName) {
      // 1. If NO argument is passed, clear the ENTIRE redis database
      console.log('🧹 No queue name provided. Clearing FULL Redis database...');
      await redis.flushdb();
      console.log('✅ Success: Full Redis database cleared.');
    } else {
      // 2. If an argument IS passed, clear only that specific queue key
      console.log(`🧹 Clearing specific queue: "${queueName}"...`);
      const result = await redis.del(queueName); 
      
      if (result === 1) {
        console.log(`✅ Success: Queue "${queueName}" was cleared.`);
      } else {
        console.log(`ℹ️ Info: Queue "${queueName}" did not exist or was already empty.`);
      }
    }
  } catch (error) {
    console.error('❌ Error executing clear command:', error.message);
  } finally {
    // Gracefully close the Redis connection
    redis.disconnect();
  }
}

clearRedisData();
