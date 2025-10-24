import { ObjectId } from 'mongodb';
import { Task, TaskPriority, TaskStatus, TaskCategory } from '../entities/Task';

export interface ITaskRepository {
  // Basic CRUD operations
  create(task: Task): Promise<Task>;
  findById(id: ObjectId): Promise<Task | null>;
  update(task: Task): Promise<Task>;
  delete(id: ObjectId): Promise<boolean>;

  // Query operations
  findAll(filters?: {
    project?: ObjectId;
    assignedTo?: ObjectId;
    assignedBy?: ObjectId;
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: TaskCategory;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ tasks: Task[]; total: number }>;

  findByProject(projectId: ObjectId): Promise<Task[]>;
  findByAssignee(userId: ObjectId): Promise<Task[]>;
  findByAssigner(userId: ObjectId): Promise<Task[]>;
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findByPriority(priority: TaskPriority): Promise<Task[]>;
  findByCategory(category: TaskCategory): Promise<Task[]>;

  // Task management
  updateStatus(taskId: ObjectId, status: TaskStatus): Promise<void>;
  updateProgress(taskId: ObjectId, actualHours: number): Promise<void>;
  assignTask(taskId: ObjectId, userId: ObjectId): Promise<void>;

  // Due date and overdue
  getOverdueTasks(): Promise<Task[]>;
  getTasksDueSoon(days: number): Promise<Task[]>;
  getTasksByDueDateRange(startDate: Date, endDate: Date): Promise<Task[]>;

  // Statistics
  getTotalCount(): Promise<number>;
  getCountByStatus(): Promise<Record<TaskStatus, number>>;
  getCountByPriority(): Promise<Record<TaskPriority, number>>;
  getCountByCategory(): Promise<Record<TaskCategory, number>>;
  getTaskCompletionRate(userId?: ObjectId): Promise<number>;
  getAverageCompletionTime(): Promise<number>;
}
