#!/usr/bin/env node

import dotenv from 'dotenv';
import { databaseInitializer } from '../infrastructure/database/init';
import { MigrationRunner } from '../infrastructure/database/migrations/MigrationRunner';
import { logger } from '../shared/utils/logger';

// Load environment variables
dotenv.config();

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');

    // Initialize database connection
    await databaseInitializer.initialize();

    // Get migration status
    const migrationRunner = MigrationRunner.getInstance();
    const status = await migrationRunner.getMigrationStatus();

    logger.info('Migration status:', status);

    if (status.pending.length > 0) {
      logger.info(`Found ${status.pending.length} pending migrations`);
      await migrationRunner.runMigrations();
    } else {
      logger.info('No pending migrations');
    }

    logger.info('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
