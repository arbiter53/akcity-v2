import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskLocation {
  block?: string;
  floor?: string;
  apartment?: string;
}

export interface ITaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: mongoose.Types.ObjectId;
}

export interface ITaskDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  project: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  priority: string;
  status: string;
  category: string;
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours: number;
  tags: string[];
  location: ITaskLocation;
  attachments: ITaskAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskLocationSchema = new Schema<ITaskLocation>({
  block: {
    type: String,
    trim: true,
    maxlength: [50, 'Block cannot exceed 50 characters'],
  },
  floor: {
    type: String,
    trim: true,
    maxlength: [50, 'Floor cannot exceed 50 characters'],
  },
  apartment: {
    type: String,
    trim: true,
    maxlength: [50, 'Apartment cannot exceed 50 characters'],
  },
}, { _id: false });

const TaskAttachmentSchema = new Schema<ITaskAttachment>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
    min: [0, 'File size cannot be negative'],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { _id: false });

const TaskSchema = new Schema<ITaskDocument>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [2, 'Title must be at least 2 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required'],
    validate: {
      validator: async function(value: mongoose.Types.ObjectId) {
        const project = await mongoose.model('Project').findById(value);
        return project && project.status !== 'cancelled';
      },
      message: 'Project must exist and not be cancelled'
    },
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned user is required'],
    validate: {
      validator: async function(value: mongoose.Types.ObjectId) {
        const user = await mongoose.model('User').findById(value);
        return user && user.status === 'active';
      },
      message: 'Assigned user must be active'
    },
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned by user is required'],
    validate: {
      validator: async function(value: mongoose.Types.ObjectId) {
        const user = await mongoose.model('User').findById(value);
        return user && user.status === 'active';
      },
      message: 'Assigned by user must be active'
    },
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Invalid priority level'
    },
    default: 'medium',
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in_progress', 'completed', 'cancelled'],
      message: 'Invalid task status'
    },
    default: 'pending',
  },
  category: {
    type: String,
    enum: {
      values: ['construction', 'electrical', 'plumbing', 'painting', 'cleaning', 'other'],
      message: 'Invalid task category'
    },
    required: [true, 'Task category is required'],
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(this: ITaskDocument, value: Date) {
        if (!value) return true;
        return value >= new Date();
      },
      message: 'Due date cannot be in the past'
    },
  },
  completedAt: {
    type: Date,
    validate: {
      validator: function(this: ITaskDocument, value: Date) {
        if (!value) return true;
        return this.status === 'completed';
      },
      message: 'Completed date can only be set for completed tasks'
    },
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000'],
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    max: [1000, 'Actual hours cannot exceed 1000'],
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters'],
  }],
  location: {
    type: TaskLocationSchema,
    default: {},
  },
  attachments: [TaskAttachmentSchema],
}, {
  timestamps: true,
  versionKey: false,
});

// Indexes for performance
TaskSchema.index({ title: 1 });
TaskSchema.index({ project: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ assignedBy: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ category: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdAt: -1 });

// Compound indexes
TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ status: 1, priority: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });

// Text search index
TaskSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for task urgency
TaskSchema.virtual('isUrgent').get(function() {
  if (this.priority === 'urgent') return true;
  if (this.dueDate && this.status !== 'completed') {
    const now = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  }
  return false;
});

// Virtual for task progress
TaskSchema.virtual('progressPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'pending') return 0;
  if (this.status === 'cancelled') return 0;
  
  if (this.estimatedHours && this.actualHours > 0) {
    return Math.min((this.actualHours / this.estimatedHours) * 100, 100);
  }
  
  return 50; // Default progress for in-progress tasks
});

// Virtual for days remaining
TaskSchema.virtual('daysRemaining').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return null;
  }
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
TaskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Pre-save middleware to set completedAt
TaskSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.status !== 'completed' && this.completedAt) {
    this.completedAt = undefined;
  }
  next();
});

// Static method to get task statistics
TaskSchema.statics.getTaskStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgActualHours: { $avg: '$actualHours' }
      }
    }
  ]);
};

// Static method to get overdue tasks
TaskSchema.statics.getOverdueTasks = function() {
  return this.find({
    status: { $in: ['pending', 'in_progress'] },
    dueDate: { $lt: new Date() }
  });
};

// Static method to get tasks by priority
TaskSchema.statics.getTasksByPriority = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Ensure virtual fields are serialized
TaskSchema.set('toJSON', { virtuals: true });
TaskSchema.set('toObject', { virtuals: true });

export const TaskModel = mongoose.model<ITaskDocument>('Task', TaskSchema);
