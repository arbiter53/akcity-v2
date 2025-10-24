import mongoose from 'mongoose';
import { logger } from '../../../shared/utils/logger';

export interface Migration {
  version: string;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export class MigrationRunner {
  private static instance: MigrationRunner;
  private migrations: Migration[] = [];

  private constructor() {}

  static getInstance(): MigrationRunner {
    if (!MigrationRunner.instance) {
      MigrationRunner.instance = new MigrationRunner();
    }
    return MigrationRunner.instance;
  }

  registerMigration(migration: Migration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version.localeCompare(b.version));
  }

  async runMigrations(): Promise<void> {
    try {
      await this.ensureMigrationCollection();
      
      const appliedMigrations = await this.getAppliedMigrations();
      const pendingMigrations = this.migrations.filter(
        migration => !appliedMigrations.includes(migration.version)
      );

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations');
        return;
      }

      logger.info(`Running ${pendingMigrations.length} migrations...`);

      for (const migration of pendingMigrations) {
        try {
          logger.info(`Running migration: ${migration.version} - ${migration.name}`);
          await migration.up();
          await this.markMigrationAsApplied(migration.version);
          logger.info(`Migration ${migration.version} completed successfully`);
        } catch (error) {
          logger.error(`Migration ${migration.version} failed:`, error);
          throw error;
        }
      }

      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Migration runner failed:', error);
      throw error;
    }
  }

  async rollbackMigration(version: string): Promise<void> {
    const migration = this.migrations.find(m => m.version === version);
    if (!migration) {
      throw new Error(`Migration ${version} not found`);
    }

    try {
      logger.info(`Rolling back migration: ${migration.version} - ${migration.name}`);
      await migration.down();
      await this.markMigrationAsRolledBack(version);
      logger.info(`Migration ${migration.version} rolled back successfully`);
    } catch (error) {
      logger.error(`Rollback of migration ${migration.version} failed:`, error);
      throw error;
    }
  }

  async getMigrationStatus(): Promise<{
    applied: string[];
    pending: string[];
    total: number;
  }> {
    const appliedMigrations = await this.getAppliedMigrations();
    const pendingMigrations = this.migrations
      .filter(migration => !appliedMigrations.includes(migration.version))
      .map(migration => migration.version);

    return {
      applied: appliedMigrations,
      pending: pendingMigrations,
      total: this.migrations.length,
    };
  }

  private async ensureMigrationCollection(): Promise<void> {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const collection = db.collection('migrations');
    await collection.createIndex({ version: 1 }, { unique: true });
  }

  private async getAppliedMigrations(): Promise<string[]> {
    const db = mongoose.connection.db;
    if (!db) {
      return [];
    }

    const collection = db.collection('migrations');
    const migrations = await collection.find({ status: 'applied' }).toArray();
    return migrations.map(m => m.version);
  }

  private async markMigrationAsApplied(version: string): Promise<void> {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const collection = db.collection('migrations');
    await collection.insertOne({
      version,
      status: 'applied',
      appliedAt: new Date(),
    });
  }

  private async markMigrationAsRolledBack(version: string): Promise<void> {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const collection = db.collection('migrations');
    await collection.updateOne(
      { version },
      { $set: { status: 'rolled_back', rolledBackAt: new Date() } }
    );
  }
}
