import { connectKafka } from './src/config/kafka';
import CoinApiWsService  from './src/services/coinApiWsService'; 
import KafkaService from './src/services/kafkaService';

const startApp = async () => {
  await connectKafka();
  await KafkaService.startConsumer();
  CoinApiWsService.connect();
};

startApp();
