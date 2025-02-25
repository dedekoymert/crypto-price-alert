import { Request, Response } from 'express';
import AlertService from '../services/alertService';
import logger from '../../../shared/utils/logger';
import { CustomError } from '../utils/error';

class AlertController {
  async createAlert(req: Request, res: Response) {
    const { assetIdBase, assetIdQuote, targetPrice } = req.body;
    const userId = req.user?.userId
    if (!userId || !assetIdBase || !assetIdQuote || !targetPrice) {
      logger.error("Missing required fields");
      throw new CustomError("Missing required fields", 400);
    }

    const alert = await AlertService.createAlert(userId, assetIdBase, assetIdQuote, targetPrice);
    res.status(201).json(alert);
  }

  async getUserAlerts(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      logger.error("User ID is required");
      throw new CustomError("User ID is required", 400);
    }

    const alerts = await AlertService.getUserAlerts(userId);
    res.status(200).json(alerts);
  }

  async deleteAlert(req: Request, res: Response) {
    const userId = req.user?.userId;
    const { alertId } = req.params;
    if (!userId || !alertId) {
      logger.error("Missing alert id");
      throw new CustomError("Missing alert id", 400);
    }

    const deletedAlert = await AlertService.deleteAlert(userId, alertId);
    if (!deletedAlert) {
      logger.error("Alert not found");
      throw new CustomError("Alert not found", 404);
    }

    res.status(200).json({ message: "Alert deleted successfully" });
  }
}

export default new AlertController();
