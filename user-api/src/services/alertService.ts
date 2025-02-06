import AlertRepository from '../repositories/alertRepository';
import redis from '../../../shared/config/redis';
import { IAlert } from '../../../shared/models/Alert';
import axios from 'axios';
import logger from '../../../shared/utils/logger';
import { producer } from '../config/kafka';

const COIN_API_URL = "https://rest.coinapi.io/v1/exchangerate";
const API_KEY = process.env.COIN_API_KEY;

class AlertService {
  private cachePrefix = "active-alerts:";

  private async fetchCurrentPrice(assetIdBase: string, assetIdQuote: string): Promise<number | null> {
    try {
      const url = `${COIN_API_URL}/${assetIdBase}/${assetIdQuote}`;
      const response = await axios.get(url, {
        headers: { Authorization: API_KEY }
      });

      if (response.data && response.data.rate) {
        return response.data.rate;
      } else {
        logger.error("Invalid response from CoinAPI:", response.data);
        return null;
      }
    } catch (error: any) {
      logger.error("CoinAPI Error:", error.response?.data || error.message);
      return null;
    }
  }
  
  async createAlert(userId: string, assetIdBase: string, assetIdQuote: string, targetPrice: number): Promise<IAlert> {
    const currentPrice = await this.fetchCurrentPrice(assetIdBase, assetIdQuote);
    if (!currentPrice) {
      throw new Error("Invalid asset pair");
    }

    const targetDirection = targetPrice > currentPrice ? "above" : "below";

    const alert = await AlertRepository.createAlert(userId, assetIdBase, assetIdQuote, targetPrice, targetDirection);
    
    const cacheKey = `${this.cachePrefix}${assetIdBase}:${assetIdQuote}`;
    if (await redis.llen(cacheKey) === 0) {
      await producer.send({
        topic: 'coin-asset-change',
        messages: [{ value: JSON.stringify({ assetIdBase, assetIdQuote, operation: "add" }) }],
      })
    }

    await redis.rpush(cacheKey, JSON.stringify({
      _id: alert._id,
      targetPrice: alert.targetPrice,
      targetDirection: alert.targetDirection,
    }));

    return alert;
  }

  async getAlert(userId: string, assetIdBase: string, assetIdQuote: string): Promise<IAlert | null> {
    return await AlertRepository.getAlert(userId, assetIdBase, assetIdQuote);
  }

  async getUserAlerts(userId: string): Promise<IAlert[]> {
    return await AlertRepository.getUserAlerts(userId);
  }

  async deleteAlert(userId: string, alertId: string): Promise<IAlert | null> {
    const deletedAlert = await AlertRepository.deleteAlert(userId, alertId);
  
    if (deletedAlert?.status === "active") {
      const cacheKey = `${this.cachePrefix}${deletedAlert.assetIdBase}:${deletedAlert.assetIdQuote}`;
      
      const alertToRemove = JSON.stringify({
        _id: deletedAlert._id,
        targetPrice: deletedAlert.targetPrice,
        targetDirection: deletedAlert.targetDirection,
      });
  
      await redis.lrem(cacheKey, 0, alertToRemove);
      
      if (await redis.llen(cacheKey) === 0) {
        await producer.send({
          topic: 'coin-asset-change',
          messages: [{ value: JSON.stringify({ 
            assetIdBase: deletedAlert.assetIdBase, 
            assetIdQuote: deletedAlert.assetIdQuote,
            operation: "remove" }) }],
        })
      }
    }
  
    return deletedAlert;
  }
  

  async syncCacheWithDB(): Promise<void> {
    logger.info("Syncing Redis cache with MongoDB...");
    const alerts = await AlertRepository.getAllActiveAlerts();

    const cacheData: Record<string, string[]> = {};
    for (const alert of alerts) {
      const cacheKey = `${this.cachePrefix}${alert.assetIdBase}:${alert.assetIdQuote}`;
      if (!cacheData[cacheKey]) cacheData[cacheKey] = [];
      cacheData[cacheKey].push(JSON.stringify({
        _id: alert._id,
        targetPrice: alert.targetPrice,
        targetDirection: alert.targetDirection,
      }));
    }

    for (const [key, alerts] of Object.entries(cacheData)) {
      await redis.del(key);
      await redis.rpush(key, ...alerts);
    }

    logger.info("Redis cache synchronized!");
  }
}

export default new AlertService();
