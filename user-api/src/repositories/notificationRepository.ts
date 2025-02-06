import Notification, { INotification } from '../../../shared/models/Notification';

class NotificationRepository {
  async getUserNotifications(userId: string): Promise<INotification[]> {
    return await Notification.find({ userId }).exec();
  }

  async deleteNotification(_id: string, userId: string): Promise<INotification | null> {
    return await Notification.findOneAndDelete({ _id, userId }).exec();
  }
}

export default new NotificationRepository();