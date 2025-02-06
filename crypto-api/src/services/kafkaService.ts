import { producer } from '../config/kafka';
import { kafkaClient } from '../config/kafka';
import CoinApiWsService from './coinApiWsService';
import logger from '../../../shared/utils/logger';

class KafkaService {
  private readonly coinAsssetChangeTopic = 'coin-asset-change';
  private readonly priceUpdateTopic = 'price-update';

  constructor() {
  }

  public async startConsumer(): Promise<void> {
    const consumer = kafkaClient.consumer({ groupId: 'crypto-api-ws-change' });
    await consumer.connect();
    await consumer.subscribe({ topic: this.coinAsssetChangeTopic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const { assetIdBase, assetIdQuote, operation } = JSON.parse(message.value!.toString() );

          if (operation === 'add') {
            CoinApiWsService.sendSubscriptionMessage(assetIdBase, assetIdQuote);
          } else if (operation === 'remove') {
            CoinApiWsService.sendUnsubscribeMessage(assetIdBase, assetIdQuote);
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

    await producer.send({
      topic: this.priceUpdateTopic,
      messages: [message],
    });
    logger.info(message);
  }
}

export default new KafkaService();
