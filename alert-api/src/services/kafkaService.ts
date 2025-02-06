import logger from '../../../shared/utils/logger';
import { kafkaClient } from '../config/kafka';
import { producer } from '../config/kafka';
import redis from '../../../shared/config/redis';

const consumer = kafkaClient.consumer({ groupId: 'alert-api-group' });

const PRICE_UPDATE_TOPIC = 'price-update';
const ALERT_NOTIFICATION_TOPIC = 'alert-notification';
const CACHE_PREFIX = 'active-alerts:';

const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: PRICE_UPDATE_TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const { assetIdBase, assetIdQuote, price, timeExchange } = JSON.parse(message.value!.toString());

        const cacheKey = `${CACHE_PREFIX}${assetIdBase}:${assetIdQuote}`;
        const alerts = await redis.lrange(cacheKey, 0, -1);

        if (alerts.length > 0) {
          for (const alert of alerts) {
            const { _id, targetPrice, targetDirection } = JSON.parse(alert);
            
            const isTriggered = (targetDirection === 'above' && price >= targetPrice) ||
                                (targetDirection === 'below' && price <= targetPrice);
            
            if (isTriggered) {
              const alertToRemove = JSON.stringify({
                _id,
                targetPrice,
                targetDirection
              });
              await redis.lrem(cacheKey, 0, alertToRemove);
              
              if (await redis.llen(cacheKey) === 0) {
                await producer.send({
                  topic: 'coin-asset-change',
                  messages: [{ value: JSON.stringify({ 
                    assetIdBase: assetIdBase, 
                    assetIdQuote: assetIdQuote,
                    operation: "remove" }) }],
                })
              }

              logger.info(`Alert triggered for ${assetIdBase}/${assetIdQuote}: ${price} reached ${targetPrice}`);
              await producer.send({
                topic: ALERT_NOTIFICATION_TOPIC,
                messages: [
                  {
                    key: _id,
                    value: JSON.stringify({ _id, price, timeExchange }),
                  },
                ],
              });
            }
          }
        }
      } catch (error) {
        logger.error('Error processing price update:', error);
      }
    },
  });
};

export default startConsumer;
