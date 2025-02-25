import { connectKafka } from './src/config/kafka';
import { KafkaService } from './src/services/kafkaService';
import { kafkaClient, producer } from './src/config/kafka';
import { CoinApiWsService } from './src/services/coinApiWsService';
import redis from '../shared/config/redis';

const startApp = async () => {
  await connectKafka();

  const kafkaService = new KafkaService(kafkaClient, producer);
  const coinApiWsService = new CoinApiWsService(redis);

  kafkaService.coinApiWsService = coinApiWsService;
  coinApiWsService.kafkaService = kafkaService;

  await kafkaService.startConsumer();
  coinApiWsService.connect();
};

startApp();
