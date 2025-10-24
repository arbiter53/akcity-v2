#!/usr/bin/env node

import dotenv from 'dotenv';
import { databaseInitializer } from '../infrastructure/database/init';
import { DatabaseSeeder } from '../infrastructure/database/seeders/DatabaseSeeder';
import { logger } from '../shared/utils/logger';

// Load environment variables
dotenv.config();

async function runSeed() {
  try {
    logger.info('Starting database seeding...');

    // Initialize database connection
    await databaseInitializer.initialize();

    // Run seeding
    const seeder = DatabaseSeeder.getInstance();
    await seeder.seed();

    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  runSeed();
}

export { runSeed };
