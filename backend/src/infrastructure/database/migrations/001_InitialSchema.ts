import { Migration } from './MigrationRunner';
import { UserModel } from '../models/UserModel';
import { ProjectModel } from '../models/ProjectModel';
import { TaskModel } from '../models/TaskModel';

export const InitialSchemaMigration: Migration = {
  version: '001',
  name: 'Initial Schema',
  up: async () => {
    // Create indexes for User model
    await UserModel.createIndexes();
    
    // Create indexes for Project model
    await ProjectModel.createIndexes();
    
    // Create indexes for Task model
    await TaskModel.createIndexes();
  },
  down: async () => {
    // Drop collections (be careful in production!)
    await UserModel.collection.drop();
    await ProjectModel.collection.drop();
    await TaskModel.collection.drop();
  },
};
