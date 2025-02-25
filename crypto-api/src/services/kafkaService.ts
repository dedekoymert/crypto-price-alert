import logger from '../../../shared/utils/logger';
import { Kafka, Producer } from 'kafkajs';
import { ICoinApiWsService } from './coinApiWsService';

export interface IKafkaService {
  startConsumer(): Promise<void>;
  publishPriceUpdate(assetIdBase: string, assetIdQuote: string, price: number, timeExchange: string): Promise<void>;
}

export class KafkaService implements IKafkaService {
  private readonly coinAsssetChangeTopic = 'coin-asset-change';
  private readonly priceUpdateTopic = 'price-update';
  private kafkaClient: Kafka;
  private producer: Producer;

  constructor(kafkaClient: Kafka, producer: Producer) {
    this.kafkaClient = kafkaClient;
    this.producer = producer;
  }

  public async startConsumer(): Promise<void> {
    const consumer = this.kafkaClient.consumer({ groupId: 'crypto-api-ws-change' });
    await consumer.connect();
    await consumer.subscribe({ topic: this.coinAsssetChangeTopic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const { assetIdBase, assetIdQuote, operation } = JSON.parse(message.value!.toString() );

          if (operation === 'add') {
            this.coinApiWsService.sendSubscriptionMessage(assetIdBase, assetIdQuote);
          } else if (operation === 'remove') {
            this.coinApiWsService.sendUnsubscribeMessage(assetIdBase, assetIdQuote);
          }

        } catch (error) {
          logger.error('Error processing alert-created message:', error);
        }
      },
    });
  }

  public async publishPriceUpdate(assetIdBase: string, assetIdQuote: string, price: number, timeExchange: string): Promise<void> {
    const message = {
      key: `${assetIdBase}-${assetIdQuote}`,
      value: JSON.stringify({ assetIdBase, assetIdQuote, price, timeExchange}),
    };

    await this.producer.send({
      topic: this.priceUpdateTopic,
      messages: [message],
    });
    logger.info(message);
  }

  set coinApiWsService(coinApiWsService: ICoinApiWsService) {
    this.coinApiWsService = coinApiWsService;
  }
}
