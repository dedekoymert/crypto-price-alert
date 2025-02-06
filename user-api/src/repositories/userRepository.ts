import User, { IUser } from '../../../shared/models/User';

class UserRepository {
  async createUser(email: string, password: string): Promise<IUser> {
    const user = new User({ email, password });
    await user.save();
    return user;
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).exec();
  }
}

export default new UserRepository();