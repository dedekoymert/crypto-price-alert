import Redis from "ioredis";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
});

redis.on("connect", () => logger.info("Redis Connected"));
redis.on("error", (err: Error) => logger.info("Redis Error:", err));

export default redis;
