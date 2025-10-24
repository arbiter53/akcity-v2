import { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters } from '../entities/Task';

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ITaskService {
  getTasks(filters?: TaskFilters): Promise<TaskListResponse>;
  getTask(id: string): Promise<Task>;
  createTask(task: CreateTaskRequest): Promise<Task>;
  updateTask(id: string, task: UpdateTaskRequest): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  assignTask(taskId: string, userId: string): Promise<void>;
  updateStatus(taskId: string, status: string): Promise<void>;
  updateProgress(taskId: string, actualHours: number): Promise<void>;
  getTaskStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
    overdue: number;
    completionRate: number;
  }>;
}
