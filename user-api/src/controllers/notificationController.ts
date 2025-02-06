import { Request, Response } from 'express';
import logger from '../../../shared/utils/logger';
import NotificationService from '../services/notificationService';

class NotificationController {
  async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }
      
      const notifications = await NotificationService.getUserNotifications(userId);
      res.status(200).json(notifications);
    } catch (error: any) {
      logger.error(error.message);
      res.status(500).json({ error: error.message });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { notificationId } = req.params;

      if (!userId || !notificationId) {
        res.status(400).json({ message: "Missing notification id" });
        return;
      }

      const deleteNotification = await NotificationService.deleteNotification(userId, notificationId);
      if (!deleteNotification) {
        res.status(404).json({ message: "Notification not found" });
        return;
      }

      res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error: any) {
      logger.error(error.message);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new NotificationController();