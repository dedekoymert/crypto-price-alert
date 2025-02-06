import { Request, Response } from 'express';
import AlertService from '../services/alertService';
import logger from '../../../shared/utils/logger';

class AlertController {
  async createAlert(req: Request, res: Response) {
    try {
      const { assetIdBase, assetIdQuote, targetPrice } = req.body;
      const userId = req.user?.userId
      if (!userId || !assetIdBase || !assetIdQuote || !targetPrice) {
        logger.error("Missing required fields");
        res.status(400).json({ message: "Missing required fields" });
        return
      }

      const alert = await AlertService.createAlert(userId, assetIdBase, assetIdQuote, targetPrice);
      res.status(201).json(alert);
    } catch (error: any) {
      logger.error(error.message);
      res.status(500).json({ message: error.message });
    }
  }

  async getUserAlerts(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      const alerts = await AlertService.getUserAlerts(userId);
      res.status(200).json(alerts);
    } catch (error: any) {
      logger.error(error.message);
      res.status(500).json({ message: error.message });
    }
  }

  async deleteAlert(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { alertId } = req.params;
      if (!userId || !alertId) {
        res.status(400).json({ message: "Missing allert id" });
        return;
      }

      const deletedAlert = await AlertService.deleteAlert(userId, alertId);
      if (!deletedAlert) {
        res.status(404).json({ message: "Alert not found" });
        return;
      }

      res.status(200).json({ message: "Alert deleted successfully" });
    } catch (error: any) {
      logger.error(error.message);
      res.status(500).json({ message: error.message });
    }
  }
}

export default new AlertController();
