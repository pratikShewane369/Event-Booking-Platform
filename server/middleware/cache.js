// backend/middleware/cache.js
const { redisClient } = require('../config/redisClient');

const cacheMiddleware = (keyPrefix, ttlSeconds = 60) => {
  return async (req, res, next) => {
    try {
      const cacheKey = `${keyPrefix}:${req.originalUrl}`;
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Override res.json to cache the response before sending
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        redisClient.setEx(cacheKey, ttlSeconds, JSON.stringify(body))
          .catch((err) => console.error('Redis SET error:', err));
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next(); // fail open — don't break the app if Redis is down
    }
  };
};

module.exports = cacheMiddleware;