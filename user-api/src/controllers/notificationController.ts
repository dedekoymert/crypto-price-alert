import { Request, Response } from 'express';
import logger from '../../../shared/utils/logger';
import NotificationService from '../services/notificationService';
import { CustomError } from '../utils/error';

class NotificationController {
  async getUserNotifications(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      logger.error("User ID is required");
      throw new CustomError("User ID is required", 400);
    }
    
    const notifications = await NotificationService.getUserNotifications(userId);
    res.status(200).json(notifications);
  }

  async deleteNotification(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId || !notificationId) {
      throw new CustomError("Missing notification id", 400);
    }

    const deleteNotification = await NotificationService.deleteNotification(userId, notificationId);
    if (!deleteNotification) {
      logger.error("Notification not found");
      throw new CustomError("Notification not found", 404);
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  }
}

export default new NotificationController();