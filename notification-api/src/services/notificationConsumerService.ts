import { Consumer } from 'kafkajs';
import logger from '../../../shared/utils/logger';
import { kafkaClient } from '../config/kafka';
import Notification from '../../../shared/models/Notification';
import Alert from '../../../shared/models/Alert';

class NotificationConsumerService {
  private consumer: Consumer;
  private readonly alertNotificationTopic: string = 'alert-notification';

  constructor() {
    this.consumer = kafkaClient.consumer({ groupId: 'notification-api-group' });
  }

  async startConsumer() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.alertNotificationTopic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const alertData = JSON.parse(message.value!.toString());

        await this.createNotification(alertData);
      },
    });
  }

  private async createNotification(alertData: any) {
    try {
      const alert = await Alert.findByIdAndUpdate(
        alertData._id,
        { status: "notActive" },
        { new: true }
      ).exec();

      if (!alert) {
        logger.error('Alert not found:', alertData._id);
        return;
      }

      const notification = new Notification({
        userId: alert.userId,
        alertId: alert._id,
        price: alertData.price,
        timeExchange: alertData.timeExchange,
      });

      await notification.save();
    } catch (error) {
      logger.error('Error storing notification:', error);
    }
  }
}

export default new NotificationConsumerService();
