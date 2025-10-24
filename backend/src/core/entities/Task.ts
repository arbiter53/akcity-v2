import { ObjectId } from 'mongodb';

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
  uploadedBy: ObjectId;
}

export interface TaskProps {
  id?: ObjectId;
  title: string;
  description: string;
  project: ObjectId;
  assignedTo: ObjectId;
  assignedBy: ObjectId;
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

export class Task {
  private constructor(private props: TaskProps) {}

  static create(props: Omit<TaskProps, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'actualHours' | 'attachments'>): Task {
    return new Task({
      ...props,
      status: TaskStatus.PENDING,
      actualHours: 0,
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static fromPersistence(data: any): Task {
    return new Task({
      id: data._id,
      title: data.title,
      description: data.description,
      project: data.project,
      assignedTo: data.assignedTo,
      assignedBy: data.assignedBy,
      priority: data.priority,
      status: data.status,
      category: data.category,
      dueDate: data.dueDate,
      completedAt: data.completedAt,
      estimatedHours: data.estimatedHours,
      actualHours: data.actualHours,
      tags: data.tags,
      location: data.location,
      attachments: data.attachments,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }

  // Getters
  get id(): ObjectId | undefined {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get project(): ObjectId {
    return this.props.project;
  }

  get assignedTo(): ObjectId {
    return this.props.assignedTo;
  }

  get assignedBy(): ObjectId {
    return this.props.assignedBy;
  }

  get priority(): TaskPriority {
    return this.props.priority;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get category(): TaskCategory {
    return this.props.category;
  }

  get dueDate(): Date | undefined {
    return this.props.dueDate;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get estimatedHours(): number | undefined {
    return this.props.estimatedHours;
  }

  get actualHours(): number {
    return this.props.actualHours;
  }

  get tags(): string[] {
    return this.props.tags;
  }

  get location(): TaskLocation {
    return this.props.location;
  }

  get attachments(): TaskAttachment[] {
    return this.props.attachments;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business Methods
  updateBasicInfo(data: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    category?: TaskCategory;
    dueDate?: Date;
    estimatedHours?: number;
  }): void {
    if (data.title) this.props.title = data.title;
    if (data.description) this.props.description = data.description;
    if (data.priority) this.props.priority = data.priority;
    if (data.category) this.props.category = data.category;
    if (data.dueDate) this.props.dueDate = data.dueDate;
    if (data.estimatedHours) this.props.estimatedHours = data.estimatedHours;
    this.props.updatedAt = new Date();
  }

  start(): void {
    if (this.props.status !== TaskStatus.PENDING) {
      throw new Error('Only pending tasks can be started');
    }
    this.props.status = TaskStatus.IN_PROGRESS;
    this.props.updatedAt = new Date();
  }

  complete(): void {
    if (this.props.status !== TaskStatus.IN_PROGRESS) {
      throw new Error('Only in-progress tasks can be completed');
    }
    this.props.status = TaskStatus.COMPLETED;
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    if (this.props.status === TaskStatus.COMPLETED) {
      throw new Error('Completed tasks cannot be cancelled');
    }
    this.props.status = TaskStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  updateActualHours(hours: number): void {
    if (hours < 0) {
      throw new Error('Actual hours cannot be negative');
    }
    this.props.actualHours = hours;
    this.props.updatedAt = new Date();
  }

  addTag(tag: string): void {
    if (!this.props.tags.includes(tag)) {
      this.props.tags.push(tag);
      this.props.updatedAt = new Date();
    }
  }

  removeTag(tag: string): void {
    this.props.tags = this.props.tags.filter(t => t !== tag);
    this.props.updatedAt = new Date();
  }

  updateLocation(location: Partial<TaskLocation>): void {
    this.props.location = { ...this.props.location, ...location };
    this.props.updatedAt = new Date();
  }

  addAttachment(attachment: Omit<TaskAttachment, 'id' | 'uploadedAt'>): void {
    const newAttachment: TaskAttachment = {
      ...attachment,
      id: new ObjectId().toString(),
      uploadedAt: new Date()
    };
    this.props.attachments.push(newAttachment);
    this.props.updatedAt = new Date();
  }

  removeAttachment(attachmentId: string): void {
    this.props.attachments = this.props.attachments.filter(att => att.id !== attachmentId);
    this.props.updatedAt = new Date();
  }

  isOverdue(): boolean {
    if (!this.props.dueDate || this.props.status === TaskStatus.COMPLETED || this.props.status === TaskStatus.CANCELLED) {
      return false;
    }
    return new Date() > this.props.dueDate;
  }

  getDaysRemaining(): number | null {
    if (!this.props.dueDate) return null;
    const now = new Date();
    const dueDate = new Date(this.props.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isUrgent(): boolean {
    return this.props.priority === TaskPriority.URGENT || 
           (this.props.dueDate && this.getDaysRemaining()! <= 1);
  }

  getProgressPercentage(): number {
    if (this.props.status === TaskStatus.COMPLETED) return 100;
    if (this.props.status === TaskStatus.PENDING) return 0;
    if (this.props.status === TaskStatus.CANCELLED) return 0;
    
    // For in-progress tasks, calculate based on actual vs estimated hours
    if (this.props.estimatedHours && this.props.actualHours > 0) {
      return Math.min((this.props.actualHours / this.props.estimatedHours) * 100, 100);
    }
    
    return 50; // Default progress for in-progress tasks without time estimates
  }

  toJSON(): Partial<TaskProps> {
    return {
      id: this.props.id,
      title: this.props.title,
      description: this.props.description,
      project: this.props.project,
      assignedTo: this.props.assignedTo,
      assignedBy: this.props.assignedBy,
      priority: this.props.priority,
      status: this.props.status,
      category: this.props.category,
      dueDate: this.props.dueDate,
      completedAt: this.props.completedAt,
      estimatedHours: this.props.estimatedHours,
      actualHours: this.props.actualHours,
      tags: this.props.tags,
      location: this.props.location,
      attachments: this.props.attachments,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }

  toPersistence(): any {
    return {
      _id: this.props.id,
      title: this.props.title,
      description: this.props.description,
      project: this.props.project,
      assignedTo: this.props.assignedTo,
      assignedBy: this.props.assignedBy,
      priority: this.props.priority,
      status: this.props.status,
      category: this.props.category,
      dueDate: this.props.dueDate,
      completedAt: this.props.completedAt,
      estimatedHours: this.props.estimatedHours,
      actualHours: this.props.actualHours,
      tags: this.props.tags,
      location: this.props.location,
      attachments: this.props.attachments,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    };
  }
}
