import { logger } from '../../../shared/utils/logger';
import { UserModel } from '../models/UserModel';
import { ProjectModel } from '../models/ProjectModel';
import { TaskModel } from '../models/TaskModel';

export class DatabaseIndexes {
  private static instance: DatabaseIndexes;

  private constructor() {}

  static getInstance(): DatabaseIndexes {
    if (!DatabaseIndexes.instance) {
      DatabaseIndexes.instance = new DatabaseIndexes();
    }
    return DatabaseIndexes.instance;
  }

  async createIndexes(): Promise<void> {
    try {
      logger.info('Creating database indexes...');

      await this.createUserIndexes();
      await this.createProjectIndexes();
      await this.createTaskIndexes();

      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Failed to create database indexes:', error);
      throw error;
    }
  }

  private async createUserIndexes(): Promise<void> {
    logger.info('Creating user indexes...');

    // Single field indexes
    await UserModel.collection.createIndex({ email: 1 }, { unique: true });
    await UserModel.collection.createIndex({ role: 1 });
    await UserModel.collection.createIndex({ status: 1 });
    await UserModel.collection.createIndex({ createdAt: -1 });
    await UserModel.collection.createIndex({ lastLogin: -1 });

    // Text search index
    await UserModel.collection.createIndex({
      name: 'text',
      email: 'text',
      phone: 'text'
    });

    // Compound indexes
    await UserModel.collection.createIndex({ role: 1, status: 1 });
    await UserModel.collection.createIndex({ status: 1, createdAt: -1 });

    logger.info('User indexes created');
  }

  private async createProjectIndexes(): Promise<void> {
    logger.info('Creating project indexes...');

    // Single field indexes
    await ProjectModel.collection.createIndex({ name: 1 });
    await ProjectModel.collection.createIndex({ status: 1 });
    await ProjectModel.collection.createIndex({ projectManager: 1 });
    await ProjectModel.collection.createIndex({ startDate: 1 });
    await ProjectModel.collection.createIndex({ endDate: 1 });
    await ProjectModel.collection.createIndex({ createdAt: -1 });

    // Text search index
    await ProjectModel.collection.createIndex({
      name: 'text',
      description: 'text',
      location: 'text'
    });

    // Compound indexes
    await ProjectModel.collection.createIndex({ status: 1, progress: 1 });
    await ProjectModel.collection.createIndex({ projectManager: 1, status: 1 });
    await ProjectModel.collection.createIndex({ startDate: 1, endDate: 1 });
    await ProjectModel.collection.createIndex({ status: 1, endDate: 1 });

    // Team member index
    await ProjectModel.collection.createIndex({ team: 1 });

    logger.info('Project indexes created');
  }

  private async createTaskIndexes(): Promise<void> {
    logger.info('Creating task indexes...');

    // Single field indexes
    await TaskModel.collection.createIndex({ title: 1 });
    await TaskModel.collection.createIndex({ project: 1 });
    await TaskModel.collection.createIndex({ assignedTo: 1 });
    await TaskModel.collection.createIndex({ assignedBy: 1 });
    await TaskModel.collection.createIndex({ status: 1 });
    await TaskModel.collection.createIndex({ priority: 1 });
    await TaskModel.collection.createIndex({ category: 1 });
    await TaskModel.collection.createIndex({ dueDate: 1 });
    await TaskModel.collection.createIndex({ createdAt: -1 });

    // Text search index
    await TaskModel.collection.createIndex({
      title: 'text',
      description: 'text',
      tags: 'text'
    });

    // Compound indexes
    await TaskModel.collection.createIndex({ project: 1, status: 1 });
    await TaskModel.collection.createIndex({ assignedTo: 1, status: 1 });
    await TaskModel.collection.createIndex({ status: 1, priority: 1 });
    await TaskModel.collection.createIndex({ dueDate: 1, status: 1 });
    await TaskModel.collection.createIndex({ project: 1, assignedTo: 1 });
    await TaskModel.collection.createIndex({ status: 1, dueDate: 1 });

    // Overdue tasks index
    await TaskModel.collection.createIndex({
      status: 1,
      dueDate: 1
    }, {
      partialFilterExpression: {
        status: { $in: ['pending', 'in_progress'] },
        dueDate: { $lt: new Date() }
      }
    });

    logger.info('Task indexes created');
  }

  async dropIndexes(): Promise<void> {
    try {
      logger.info('Dropping database indexes...');

      await UserModel.collection.dropIndexes();
      await ProjectModel.collection.dropIndexes();
      await TaskModel.collection.dropIndexes();

      logger.info('Database indexes dropped successfully');
    } catch (error) {
      logger.error('Failed to drop database indexes:', error);
      throw error;
    }
  }

  async getIndexStats(): Promise<{
    users: any[];
    projects: any[];
    tasks: any[];
  }> {
    try {
      const [users, projects, tasks] = await Promise.all([
        UserModel.collection.indexes(),
        ProjectModel.collection.indexes(),
        TaskModel.collection.indexes(),
      ]);

      return { users, projects, tasks };
    } catch (error) {
      logger.error('Failed to get index stats:', error);
      throw error;
    }
  }
}
