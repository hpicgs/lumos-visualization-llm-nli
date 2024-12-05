const Queue = require('bull');

const testRunQueue = new Queue("test-run-queue", {
    redis: { host: process.env['REDIS_HOST'], port: 6379 }
});

module.exports = testRunQueue;