import { connectDB } from '../shared/config/database';
import { connectKafka } from './src/config/kafka';
import NotificationConsumerService from './src/services/notificationConsumerService';
import dotenv from 'dotenv';

dotenv.config();

const startApp = async () => {
  await connectDB();
  await connectKafka();
  await NotificationConsumerService.startConsumer();
};

startApp();
