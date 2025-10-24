import { ObjectId } from 'mongodb';
import { Project, ProjectStatus } from '../entities/Project';

export interface IProjectRepository {
  // Basic CRUD operations
  create(project: Project): Promise<Project>;
  findById(id: ObjectId): Promise<Project | null>;
  update(project: Project): Promise<Project>;
  delete(id: ObjectId): Promise<boolean>;

  // Query operations
  findAll(filters?: {
    status?: ProjectStatus;
    projectManager?: ObjectId;
    teamMember?: ObjectId;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ projects: Project[]; total: number }>;

  findByManager(managerId: ObjectId): Promise<Project[]>;
  findByTeamMember(memberId: ObjectId): Promise<Project[]>;
  findByStatus(status: ProjectStatus): Promise<Project[]>;

  // Team management
  addTeamMember(projectId: ObjectId, userId: ObjectId): Promise<void>;
  removeTeamMember(projectId: ObjectId, userId: ObjectId): Promise<void>;

  // Progress and status
  updateProgress(projectId: ObjectId, progress: number): Promise<void>;
  updateStatus(projectId: ObjectId, status: ProjectStatus): Promise<void>;

  // Statistics
  getTotalCount(): Promise<number>;
  getCountByStatus(): Promise<Record<ProjectStatus, number>>;
  getOverdueProjects(): Promise<Project[]>;
  getProjectsByProgressRange(min: number, max: number): Promise<Project[]>;
}
