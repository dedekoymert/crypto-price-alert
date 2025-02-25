import { connectKafka } from './src/config/kafka';
import startConsumer from './src/services/kafkaService';
import redis from '../shared/config/redis';
import { kafkaClient, producer } from './src/config/kafka';


const startApp = async () => {
  await connectKafka();
  const consumer = kafkaClient.consumer({ groupId: 'alert-api-group' });
  await startConsumer(consumer, producer, redis);
};

startApp();
