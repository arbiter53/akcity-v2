import { ObjectId } from 'mongodb';
import { User } from '../../../core/entities/User';
import { IUserRepository } from '../../../core/interfaces/IUserRepository';
import { UserModel, IUserDocument } from '../models/UserModel';

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const userDoc = new UserModel(user.toPersistence());
    const savedUser = await userDoc.save();
    return User.fromPersistence(savedUser);
  }

  async findById(id: ObjectId): Promise<User | null> {
    const userDoc = await UserModel.findById(id);
    return userDoc ? User.fromPersistence(userDoc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ email: email.toLowerCase() });
    return userDoc ? User.fromPersistence(userDoc) : null;
  }

  async update(user: User): Promise<User> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      user.id,
      user.toPersistence(),
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    return User.fromPersistence(updatedUser);
  }

  async delete(id: ObjectId): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(filters?: {
    role?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ users: User[]; total: number }> {
    const query: any = {};

    if (filters?.role) {
      query.role = filters.role;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.search) {
      query.$text = { $search: filters.search };
    }

    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      UserModel.countDocuments(query)
    ]);

    return {
      users: users.map(user => User.fromPersistence(user)),
      total
    };
  }

  async findByRole(role: string): Promise<User[]> {
    const users = await UserModel.find({ role }).lean();
    return users.map(user => User.fromPersistence(user));
  }

  async findByStatus(status: string): Promise<User[]> {
    const users = await UserModel.find({ status }).lean();
    return users.map(user => User.fromPersistence(user));
  }

  async findByProject(projectId: ObjectId): Promise<User[]> {
    const users = await UserModel.find({ projects: projectId }).lean();
    return users.map(user => User.fromPersistence(user));
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const userDoc = await UserModel.findByEmailWithPassword(email);
    return userDoc ? User.fromPersistence(userDoc) : null;
  }

  async updateLastLogin(id: ObjectId): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async addToProject(userId: ObjectId, projectId: ObjectId): Promise<void> {
    await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { projects: projectId } }
    );
  }

  async removeFromProject(userId: ObjectId, projectId: ObjectId): Promise<void> {
    await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { projects: projectId } }
    );
  }

  async getTotalCount(): Promise<number> {
    return await UserModel.countDocuments();
  }

  async getCountByRole(): Promise<Record<string, number>> {
    const stats = await UserModel.getUserStats();
    const result: Record<string, number> = {};
    
    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });
    
    return result;
  }

  async getCountByStatus(): Promise<Record<string, number>> {
    const stats = await UserModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result: Record<string, number> = {};
    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });
    
    return result;
  }
}
