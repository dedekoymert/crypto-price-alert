import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from "../../../shared/utils/logger";

dotenv.config();

class AuthMiddleware {
  authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
      req.user = { userId: decoded.userId };
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid token' });
    }
  }
}

export default new AuthMiddleware();