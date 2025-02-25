import WebSocket from 'ws';
import logger from '../../../shared/utils/logger'
import { IKafkaService } from './kafkaService';
import Redis from 'ioredis';

const COIN_API_WS_URL = process.env.COIN_API_WS_URL || 'wss://ws.coinapi.io/v1/';
const API_KEY = process.env.COIN_API_KEY;

export interface ICoinApiWsService {
  connect(): void;
  sendSubscriptionMessage(assetIdBase: string, assetIdQuote: string): void;
  sendUnsubscribeMessage(assetIdBase: string, assetIdQuote: string): void;
}

export class CoinApiWsService implements ICoinApiWsService {
  private ws: WebSocket | null = null;
  private redis: Redis;

  private readonly coinApiUrl = COIN_API_WS_URL;
  private readonly apiKey = API_KEY;
  private readonly maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private readonly cachePrefix = 'active-alerts:';
  
  constructor(redis: Redis) {
    this.redis = redis;
    this.connect()
  }

  public connect() {
    this.ws = new WebSocket(this.coinApiUrl, {
      headers: { 'X-CoinAPI-Key': this.apiKey },
    });

    this.ws.on('open', async () => {
      logger.info('Connected to CoinAPI WebSocket');
      this.reconnectAttempts = 0;
      await this.updateSubscriptions();
    });

    this.ws.on('message', (data: string) => {
      this.handleIncomingData(data);
    });

    this.ws.on('close', () => {
      logger.error('CoinAPI WebSocket Disconnected! Reconnecting...');
      this.reconnect();
    });

    this.ws.on('error', (err: Error) => logger.error('CoinAPI WebSocket Error:', err));
  }

  private handleIncomingData(data: string) {
    const parsedData = JSON.parse(data);
    if (parsedData.type === 'trade') {
      const parts = parsedData.symbol_id.split('_');
      this.kafkaService.publishPriceUpdate(parts[2], parts[3], parsedData.price, parsedData.time_exchange);
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logger.info(`Reconnecting in 5 seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), 5000);
    } else {
      logger.error('Maximum reconnect attempts reached. Could not reconnect to CoinAPI WebSocket.');
    }
  }

  public sendSubscriptionMessage(assetIdBase: string, assetIdQuote: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'subscribe',
        heartbeat: false,
        subscribe_data_type: ['trade'],
        subscribe_filter_asset_id: [`${assetIdBase}/${assetIdQuote}`],
      });
      this.ws.send(message);
      logger.info(`Sent subscription for: ${assetIdBase}/${assetIdQuote}`);
    } else {
      logger.error('WebSocket is not open. Cannot send subscription message.');
    }
  }

  public sendUnsubscribeMessage(assetIdBase: string, assetIdQuote: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'unsubscribe',
        heartbeat: false,
        subscribe_data_type: ['trade'],
        subscribe_filter_asset_id: [`${assetIdBase}/${assetIdQuote}`],
      });
      this.ws.send(message);
      logger.info(`Sent unsubscription for: ${assetIdBase}/${assetIdQuote}`);
    } else {
      logger.error('WebSocket is not open. Cannot send unsubscription message.');
    }
  }

  private async updateSubscriptions() {
    const keys = await this.redis.keys(`${this.cachePrefix}*`);
    const pairs = keys.map((key) => {
      const parts = key.split(':');
      return { assetIdBase: parts[1], assetIdQuote: parts[2] };
    });

    pairs.forEach(({ assetIdBase, assetIdQuote }) => {
      this.sendSubscriptionMessage(assetIdBase, assetIdQuote);
    });
  }

  set kafkaService(kafkaService: IKafkaService) {
    this.kafkaService = kafkaService
  }

}

