import { Migration } from './MigrationRunner';
import mongoose from 'mongoose';

export const AddUserRolesMigration: Migration = {
  version: '002',
  name: 'Add User Roles',
  up: async () => {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    // Create a default admin user if no users exist
    const userCount = await db.collection('users').countDocuments();
    
    if (userCount === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      
      await db.collection('users').insertOne({
        name: 'System Administrator',
        email: 'admin@akcity.com',
        password: hashedPassword,
        phone: '+905551234567',
        role: 'general_manager',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  },
  down: async () => {
    // Remove default admin user
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    await db.collection('users').deleteOne({
      email: 'admin@akcity.com'
    });
  },
};
