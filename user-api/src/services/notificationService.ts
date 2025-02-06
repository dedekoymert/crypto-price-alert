import dotenv from 'dotenv';
import NotificationRepository from '../repositories/notificationRepository';
import { INotification } from '../../../shared/models/Notification';

dotenv.config();

class NotificationService {
  async getUserNotifications(userId: string): Promise<INotification[]> {
    return await NotificationRepository.getUserNotifications(userId);
  }

  async deleteNotification(_id: string, userId: string): Promise<INotification | null> {
    return await NotificationRepository.deleteNotification(_id, userId);
  }
}

export default new NotificationService();