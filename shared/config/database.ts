import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config();

export const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crypto-alerts';
    await mongoose.connect(MONGO_URI || "mongodb://mongo-service:27017/alerts");
    logger.info('Connected to MongoDB')
  } catch (error) {
    logger.error('MongoDB connection error:', error);
  }
};
