import { Project, CreateProjectRequest, UpdateProjectRequest, ProjectFilters } from '../entities/Project';

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProjectService {
  getProjects(filters?: ProjectFilters): Promise<ProjectListResponse>;
  getProject(id: string): Promise<Project>;
  createProject(project: CreateProjectRequest): Promise<Project>;
  updateProject(id: string, project: UpdateProjectRequest): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  addTeamMember(projectId: string, userId: string): Promise<void>;
  removeTeamMember(projectId: string, userId: string): Promise<void>;
  updateProgress(projectId: string, progress: number): Promise<void>;
  updateStatus(projectId: string, status: string): Promise<void>;
  getProjectStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byProgress: Record<string, number>;
    overdue: number;
  }>;
}
