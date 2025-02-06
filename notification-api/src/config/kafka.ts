import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import logger from '../../../shared/utils/logger';

dotenv.config();

export const kafkaClient = new Kafka({
  clientId: 'notification-api',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  sasl: {
    mechanism: 'scram-sha-256', 
    username: process.env.KAFKA_USER || 'user',
    password: process.env.KAFKA_PASSWORD || 'password',
  },
});

export const producer = kafkaClient.producer();

export const connectKafka = async () => {
  await producer.connect();
  logger.info('Connected to Kafka');
};