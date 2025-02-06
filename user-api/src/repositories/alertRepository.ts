import Alert, { IAlert } from '../../../shared/models/Alert';

class AlertRepository {
  async createAlert(
    userId: string,
    assetIdBase: string,
    assetIdQuote: string,
    targetPrice: number,
    targetDirection: string
  ): Promise<IAlert> {
    const alert = new Alert({ userId, assetIdBase, assetIdQuote, targetPrice, targetDirection });
    return await alert.save();
  }

  async getAlert(userId: string, assetIdBase: string, assetIdQuote: string): Promise<IAlert | null> {
    return await Alert.findOne({ userId, assetIdBase, assetIdQuote }).exec();
  }

  async deleteAlert(userId: string, _id: string): Promise<IAlert | null> {
    return await Alert.findOneAndDelete({ userId, _id }).exec();
  }

  async getUserAlerts(userId: string): Promise<IAlert[]> {
    return await Alert.find({ userId }).exec();
  }

  async getAllActiveAlerts(): Promise<IAlert[]> {
    const status = 'active'
    return await Alert.find({ status }).exec();
  }
}

export default new AlertRepository();
