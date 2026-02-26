import { createClient } from "redis";
import { Logger } from "utils/logger.js";

const logger = Logger.getInstance();

const redisClient = createClient({
  socket: {
    host: String(process.env.REDIS_HOST),
    port: Number(process.env.REDIS_PORT),
  },
});

redisClient.on("error", (err) => logger.error("Redis Client Error", err));

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    logger.error("Redis connection Error", error);
    console.log("Redis connection error", error);
    process.exit(1);
  }
}

connectRedis();

export default redisClient;
