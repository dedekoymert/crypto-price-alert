import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from "../../../shared/utils/logger";
import { CustomError } from "../utils/error";

dotenv.config();

class AuthMiddleware {
  authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new CustomError('Access denied. No token provided.', 401);
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
      req.user = { userId: decoded.userId };
      next();
    } catch (error) {
      throw new CustomError('Invalid token', 401); }
  }
}

export default new AuthMiddleware();