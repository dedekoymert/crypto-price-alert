import { Request, Response } from 'express';
import AuthService from '../services/authService';
import logger from '../../../shared/utils/logger';
import { CustomError } from '../utils/error';

class AuthController {
  async register(req: Request, res: Response) {
    const { email, password } = req.body;
    if (email === undefined || password === undefined) {
      logger.error('Missing required fields');
      throw new CustomError('Missing required fields', 400);
    }
    const user = await AuthService.register(email, password);
    res.status(201).json({ message: 'User registered successfully', user });
  }

  async login(req: Request, res: Response) {
      const { email, password } = req.body;
      if (email === undefined || password === undefined) {
        logger.error('Missing required fields');
        throw new CustomError('Missing required fields', 400);
      }
      const token = await AuthService.login(email, password);
      res.status(200).json({ token });
  }
}

export default new AuthController();