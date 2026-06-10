import Redis from "ioredis";

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB,
});

redisClient.on("connect", () => {
    console.log("Redis Connected Successfully");
});

redisClient.on("error", (err) => {
    console.log("Redis Connection Error", err);
});

export default redisClient;