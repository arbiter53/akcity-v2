import { logger } from '../../../shared/utils/logger';
import { UserModel } from '../models/UserModel';
import { ProjectModel } from '../models/ProjectModel';
import { TaskModel } from '../models/TaskModel';
import bcrypt from 'bcryptjs';

export class DatabaseSeeder {
  private static instance: DatabaseSeeder;

  private constructor() {}

  static getInstance(): DatabaseSeeder {
    if (!DatabaseSeeder.instance) {
      DatabaseSeeder.instance = new DatabaseSeeder();
    }
    return DatabaseSeeder.instance;
  }

  async seed(): Promise<void> {
    try {
      logger.info('Starting database seeding...');

      // Check if data already exists
      const userCount = await UserModel.countDocuments();
      if (userCount > 0) {
        logger.info('Database already has data, skipping seed');
        return;
      }

      // Seed users
      await this.seedUsers();
      
      // Seed projects
      await this.seedProjects();
      
      // Seed tasks
      await this.seedTasks();

      logger.info('Database seeding completed successfully');
    } catch (error) {
      logger.error('Database seeding failed:', error);
      throw error;
    }
  }

  private async seedUsers(): Promise<void> {
    logger.info('Seeding users...');

    const users = [
      {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@akcity.com',
        password: await bcrypt.hash('Password123!', 12),
        phone: '+905551234567',
        role: 'general_manager',
        status: 'active',
      },
      {
        name: 'Mehmet Demir',
        email: 'mehmet@akcity.com',
        password: await bcrypt.hash('Password123!', 12),
        phone: '+905551234568',
        role: 'project_manager',
        status: 'active',
      },
      {
        name: 'Ayşe Kaya',
        email: 'ayse@akcity.com',
        password: await bcrypt.hash('Password123!', 12),
        phone: '+905551234569',
        role: 'architect',
        status: 'active',
      },
      {
        name: 'Ali Özkan',
        email: 'ali@akcity.com',
        password: await bcrypt.hash('Password123!', 12),
        phone: '+905551234570',
        role: 'chief_engineer',
        status: 'active',
      },
      {
        name: 'Fatma Şen',
        email: 'fatma@akcity.com',
        password: await bcrypt.hash('Password123!', 12),
        phone: '+905551234571',
        role: 'worker',
        status: 'active',
      },
      {
        name: 'Mustafa Çelik',
        email: 'mustafa@akcity.com',
        password: await bcrypt.hash('Password123!', 12),
        phone: '+905551234572',
        role: 'driver',
        status: 'active',
      },
      {
        name: 'Zeynep Arslan',
        email: 'zeynep@akcity.com',
        password: await bcrypt.hash('Password123!', 12),
        phone: '+905551234573',
        role: 'purchasing_manager',
        status: 'active',
      },
      {
        name: 'Emre Yıldız',
        email: 'emre@akcity.com',
        password: await bcrypt.hash('Password123!', 12),
        phone: '+905551234574',
        role: 'client',
        status: 'active',
      },
    ];

    await UserModel.insertMany(users);
    logger.info(`${users.length} users seeded`);
  }

  private async seedProjects(): Promise<void> {
    logger.info('Seeding projects...');

    // Get user IDs for project manager and team
    const projectManager = await UserModel.findOne({ role: 'project_manager' });
    const architect = await UserModel.findOne({ role: 'architect' });
    const chiefEngineer = await UserModel.findOne({ role: 'chief_engineer' });
    const worker = await UserModel.findOne({ role: 'worker' });

    if (!projectManager || !architect || !chiefEngineer || !worker) {
      throw new Error('Required users not found for project seeding');
    }

    const projects = [
      {
        name: 'Merkez Plaza',
        description: 'Modern ofis binası inşaat projesi',
        location: 'İstanbul, Beşiktaş',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
        status: 'in_progress',
        progress: 45,
        projectManager: projectManager._id,
        team: [architect._id, chiefEngineer._id, worker._id],
        buildingInfo: {
          totalBlocks: 2,
          totalApartments: 0,
          apartmentsPerBlock: 0,
          floorsPerBlock: 8,
          totalArea: 15000,
          constructionType: 'commercial',
        },
        client: {
          name: 'ABC İnşaat A.Ş.',
          contact: 'Hasan Yılmaz',
          phone: '+905551234580',
          email: 'hasan@abcinsaat.com',
          address: 'İstanbul, Şişli',
        },
      },
      {
        name: 'Garden Residence',
        description: 'Lüks konut projesi',
        location: 'Ankara, Çankaya',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2025-06-30'),
        status: 'planning',
        progress: 15,
        projectManager: projectManager._id,
        team: [architect._id, chiefEngineer._id],
        buildingInfo: {
          totalBlocks: 4,
          totalApartments: 120,
          apartmentsPerBlock: 30,
          floorsPerBlock: 10,
          totalArea: 25000,
          constructionType: 'residential',
        },
        client: {
          name: 'XYZ Gayrimenkul',
          contact: 'Elif Demir',
          phone: '+905551234581',
          email: 'elif@xyzgayrimenkul.com',
          address: 'Ankara, Çankaya',
        },
      },
    ];

    await ProjectModel.insertMany(projects);
    logger.info(`${projects.length} projects seeded`);
  }

  private async seedTasks(): Promise<void> {
    logger.info('Seeding tasks...');

    // Get project and user IDs
    const project = await ProjectModel.findOne();
    const projectManager = await UserModel.findOne({ role: 'project_manager' });
    const worker = await UserModel.findOne({ role: 'worker' });
    const architect = await UserModel.findOne({ role: 'architect' });

    if (!project || !projectManager || !worker || !architect) {
      throw new Error('Required data not found for task seeding');
    }

    const tasks = [
      {
        title: 'Temel kazı işleri',
        description: 'Proje alanında temel kazı işlerinin tamamlanması',
        project: project._id,
        assignedTo: worker._id,
        assignedBy: projectManager._id,
        priority: 'high',
        status: 'in_progress',
        category: 'construction',
        dueDate: new Date('2024-02-15'),
        estimatedHours: 40,
        actualHours: 25,
        tags: ['temel', 'kazı', 'hazırlık'],
        location: {
          block: 'A',
          floor: 'Zemin',
        },
      },
      {
        title: 'Elektrik tesisatı planı',
        description: 'Bina elektrik tesisatının planlanması ve çizimi',
        project: project._id,
        assignedTo: architect._id,
        assignedBy: projectManager._id,
        priority: 'medium',
        status: 'pending',
        category: 'electrical',
        dueDate: new Date('2024-02-20'),
        estimatedHours: 16,
        actualHours: 0,
        tags: ['elektrik', 'plan', 'tesisat'],
        location: {
          block: 'A',
          floor: '1',
        },
      },
      {
        title: 'Su tesisatı kontrolü',
        description: 'Mevcut su tesisatının kontrol edilmesi',
        project: project._id,
        assignedTo: worker._id,
        assignedBy: projectManager._id,
        priority: 'urgent',
        status: 'pending',
        category: 'plumbing',
        dueDate: new Date('2024-02-10'),
        estimatedHours: 8,
        actualHours: 0,
        tags: ['su', 'tesisat', 'kontrol'],
        location: {
          block: 'A',
          floor: 'Zemin',
        },
      },
    ];

    await TaskModel.insertMany(tasks);
    logger.info(`${tasks.length} tasks seeded`);
  }

  async clear(): Promise<void> {
    try {
      logger.info('Clearing database...');
      
      await UserModel.deleteMany({});
      await ProjectModel.deleteMany({});
      await TaskModel.deleteMany({});
      
      logger.info('Database cleared successfully');
    } catch (error) {
      logger.error('Database clearing failed:', error);
      throw error;
    }
  }
}
