import { Request, Response } from 'express';
import AuthService from '../services/authService';
import logger from '../../../shared/utils/logger';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.register(email, password);
      res.status(201).json({ message: 'User registered successfully', user });
    } catch (error: any) {
      logger.error(error.message);
      res.status(500).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const token = await AuthService.login(email, password);
      res.json({ token });
    } catch (error: any) {
      logger.error(error.message);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AuthController();