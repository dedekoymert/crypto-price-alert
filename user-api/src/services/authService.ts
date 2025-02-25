import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserRepository from '../repositories/userRepository';
import { CustomError } from '../utils/error';

dotenv.config();

class AuthService {
  async register(email: string, password: string) {
    const existingUser = await UserRepository.findUserByEmail(email);
    if (existingUser) {
      throw new CustomError('User already exists', 400);
    }
    const user = await UserRepository.createUser(email, password);
    return user;
  }

  async login(email: string, password: string): Promise<string> {
    const user = await UserRepository.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new CustomError('Invalid credentials', 400);
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    return token;
  }
}

export default new AuthService();