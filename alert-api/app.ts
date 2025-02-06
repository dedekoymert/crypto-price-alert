import { connectKafka } from './src/config/kafka';
import startConsumer from './src/services/kafkaService';
import logger from '../shared/utils/logger';

const startApp = async () => {
  await connectKafka();
  await startConsumer();
};

startApp();
