import { databaseConnection } from './connection';
import { MigrationRunner } from './migrations/MigrationRunner';
import { DatabaseSeeder } from './seeders/DatabaseSeeder';
import { DatabaseIndexes } from './indexes/DatabaseIndexes';
import { InitialSchemaMigration } from './migrations/001_InitialSchema';
import { AddUserRolesMigration } from './migrations/002_AddUserRoles';
import { logger } from '../../shared/utils/logger';

export class DatabaseInitializer {
  private static instance: DatabaseInitializer;

  private constructor() {}

  static getInstance(): DatabaseInitializer {
    if (!DatabaseInitializer.instance) {
      DatabaseInitializer.instance = new DatabaseInitializer();
    }
    return DatabaseInitializer.instance;
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing database...');

      // Connect to database
      await databaseConnection.connect({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/akcity_v2',
        options: {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        },
      });

      // Register migrations
      const migrationRunner = MigrationRunner.getInstance();
      migrationRunner.registerMigration(InitialSchemaMigration);
      migrationRunner.registerMigration(AddUserRolesMigration);

      // Run migrations
      await migrationRunner.runMigrations();

      // Create indexes
      const indexManager = DatabaseIndexes.getInstance();
      await indexManager.createIndexes();

      // Seed database if needed
      if (process.env.NODE_ENV === 'development' || process.env.SEED_DATABASE === 'true') {
        const seeder = DatabaseSeeder.getInstance();
        await seeder.seed();
      }

      logger.info('Database initialization completed successfully');
    } catch (error) {
      logger.error('Database initialization failed:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{
    status: string;
    connection: any;
    migrations: any;
  }> {
    try {
      const connection = await databaseConnection.healthCheck();
      const migrationRunner = MigrationRunner.getInstance();
      const migrations = await migrationRunner.getMigrationStatus();

      return {
        status: 'healthy',
        connection,
        migrations,
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        connection: null,
        migrations: null,
      };
    }
  }

  async close(): Promise<void> {
    try {
      await databaseConnection.disconnect();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Failed to close database connection:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseInitializer = DatabaseInitializer.getInstance();
