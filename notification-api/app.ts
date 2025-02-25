import { connectDB } from '../shared/config/database';
import { connectKafka, kafkaClient } from './src/config/kafka';
import dotenv from 'dotenv';
import { INotificationConsumerService, NotificationConsumerService } from './src/services/notificationConsumerService';

dotenv.config();

const startApp = async () => {
  await connectDB();
  await connectKafka();

  const notificationConsumerService = new NotificationConsumerService(kafkaClient);
  await notificationConsumerService.startConsumer();
};

startApp();
