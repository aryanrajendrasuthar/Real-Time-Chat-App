const Redis = require('ioredis');

let redis;

const getRedis = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
    });

    redis.on('connect', () => console.log('Redis connected'));
    redis.on('error', (err) => console.warn('Redis error (non-fatal):', err.message));
  }
  return redis;
};

module.exports = { getRedis };
