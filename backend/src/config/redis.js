const Redis = require('ioredis');
require('dotenv').config();

let redisClient = null;

if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });

    redisClient.on('connect', () => {
        console.log('Connected to Cloud Redis successfully.');
    });

    redisClient.on('error', (err) => {
        console.warn('Redis warning/error:', err.message);
    });
} else {
    console.warn('REDIS_URL is not defined in environment variables.');
}

module.exports = redisClient;

