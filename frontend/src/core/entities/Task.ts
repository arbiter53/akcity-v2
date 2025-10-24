export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskCategory {
  CONSTRUCTION = 'construction',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  PAINTING = 'painting',
  CLEANING = 'cleaning',
  OTHER = 'other'
}

export interface TaskLocation {
  block?: string;
  floor?: string;
  apartment?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  assignedTo: string;
  assignedBy: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours: number;
  tags: string[];
  location: TaskLocation;
  attachments: TaskAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  project: string;
  assignedTo: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: Date;
  estimatedHours?: number;
  tags?: string[];
  location?: TaskLocation;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assignedTo?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: TaskCategory;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  location?: TaskLocation;
}

export interface TaskFilters {
  project?: string;
  assignedTo?: string;
  assignedBy?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  search?: string;
  page?: number;
  limit?: number;
}
