import { ObjectId } from 'mongodb';
import { User, UserRole, UserStatus } from '../entities/User';

export interface IUserRepository {
  // Basic CRUD operations
  create(user: User): Promise<User>;
  findById(id: ObjectId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: ObjectId): Promise<boolean>;

  // Query operations
  findAll(filters?: {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ users: User[]; total: number }>;

  findByRole(role: UserRole): Promise<User[]>;
  findByStatus(status: UserStatus): Promise<User[]>;
  findByProject(projectId: ObjectId): Promise<User[]>;

  // Authentication related
  findByEmailWithPassword(email: string): Promise<User | null>;
  updateLastLogin(id: ObjectId): Promise<void>;

  // Team management
  addToProject(userId: ObjectId, projectId: ObjectId): Promise<void>;
  removeFromProject(userId: ObjectId, projectId: ObjectId): Promise<void>;

  // Statistics
  getTotalCount(): Promise<number>;
  getCountByRole(): Promise<Record<UserRole, number>>;
  getCountByStatus(): Promise<Record<UserStatus, number>>;
}
