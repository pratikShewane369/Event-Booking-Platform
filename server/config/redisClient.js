const { createClient } = require("redis");

console.log("DEBUG REDIS_URL:", process.env.REDIS_URL);

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
    console.error("❌ Redis Client Error:", err);
});

redisClient.on("connect", () => {
    console.log("🔄 Redis connecting...");
});

redisClient.on("ready", () => {
    console.log("✅ Redis connected and ready");
});

redisClient.on("reconnecting", () => {
    console.log("🔄 Redis reconnecting...");
});

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};

module.exports = {
    redisClient,
    connectRedis,
};