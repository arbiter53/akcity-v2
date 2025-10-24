import mongoose, { Schema, Document } from 'mongoose';

export interface IBuildingInfo {
  totalBlocks: number;
  totalApartments: number;
  apartmentsPerBlock: number;
  floorsPerBlock: number;
  totalArea: number;
  constructionType: string;
}

export interface IClientInfo {
  name: string;
  contact: string;
  phone: string;
  email: string;
  address?: string;
}

export interface IProjectDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: string;
  progress: number;
  projectManager: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId[];
  buildingInfo: IBuildingInfo;
  client: IClientInfo;
  documents?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const BuildingInfoSchema = new Schema<IBuildingInfo>({
  totalBlocks: {
    type: Number,
    min: [1, 'En az 1 blok olmalıdır'],
    max: [50, 'En fazla 50 blok olabilir'],
  },
  totalApartments: {
    type: Number,
    min: [1, 'En az 1 daire olmalıdır'],
    max: [1000, 'En fazla 1000 daire olabilir'],
  },
  apartmentsPerBlock: {
    type: Number,
    min: [1, 'Her blokta en az 1 daire olmalıdır'],
    max: [100, 'Her blokta en fazla 100 daire olabilir'],
  },
  floorsPerBlock: {
    type: Number,
    min: [1, 'Her blokta en az 1 kat olmalıdır'],
    max: [50, 'Her blokta en fazla 50 kat olabilir'],
  },
  totalArea: {
    type: Number,
    min: [1, 'Toplam alan en az 1 m² olmalıdır'],
  },
  constructionType: {
    type: String,
    enum: {
      values: ['residential', 'commercial', 'industrial', 'infrastructure'],
      message: 'Invalid construction type'
    },
    required: true,
  },
}, { _id: false });

const ClientInfoSchema = new Schema<IClientInfo>({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters'],
  },
  contact: {
    type: String,
    required: [true, 'Client contact person is required'],
    trim: true,
    maxlength: [100, 'Contact person name cannot exceed 100 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Client phone is required'],
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'],
  },
  email: {
    type: String,
    required: [true, 'Client email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters'],
  },
}, { _id: false });

const ProjectSchema = new Schema<IProjectDocument>({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [2, 'Project name must be at least 2 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  location: {
    type: String,
    required: [true, 'Project location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(this: IProjectDocument, value: Date) {
        return value >= new Date();
      },
      message: 'Start date cannot be in the past'
    },
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: IProjectDocument, value: Date) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    },
  },
  status: {
    type: String,
    enum: {
      values: ['planning', 'in_progress', 'completed', 'suspended', 'cancelled'],
      message: 'Invalid project status'
    },
    default: 'planning',
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
    default: 0,
  },
  projectManager: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project manager is required'],
    validate: {
      validator: async function(value: mongoose.Types.ObjectId) {
        const user = await mongoose.model('User').findById(value);
        return user && ['general_manager', 'project_manager'].includes(user.role);
      },
      message: 'Project manager must have appropriate role'
    },
  },
  team: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(value: mongoose.Types.ObjectId) {
        const user = await mongoose.model('User').findById(value);
        return user && user.status === 'active';
      },
      message: 'Team members must be active users'
    },
  }],
  buildingInfo: {
    type: BuildingInfoSchema,
    required: [true, 'Building information is required'],
  },
  client: {
    type: ClientInfoSchema,
    required: [true, 'Client information is required'],
  },
  documents: [{
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
  }],
}, {
  timestamps: true,
  versionKey: false,
});

// Indexes for performance
ProjectSchema.index({ name: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ projectManager: 1 });
ProjectSchema.index({ team: 1 });
ProjectSchema.index({ startDate: 1 });
ProjectSchema.index({ endDate: 1 });
ProjectSchema.index({ createdAt: -1 });

// Compound indexes
ProjectSchema.index({ status: 1, progress: 1 });
ProjectSchema.index({ projectManager: 1, status: 1 });
ProjectSchema.index({ startDate: 1, endDate: 1 });

// Text search index
ProjectSchema.index({
  name: 'text',
  description: 'text',
  location: 'text'
});

// Virtual for project duration
ProjectSchema.virtual('duration').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
});

// Virtual for project status
ProjectSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'in_progress') return false;
  return new Date() > this.endDate;
});

// Virtual for days remaining
ProjectSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return 0;
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate dates
ProjectSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

// Static method to get project statistics
ProjectSchema.statics.getProjectStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProgress: { $avg: '$progress' }
      }
    }
  ]);
};

// Static method to get overdue projects
ProjectSchema.statics.getOverdueProjects = function() {
  return this.find({
    status: 'in_progress',
    endDate: { $lt: new Date() }
  });
};

// Ensure virtual fields are serialized
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

export const ProjectModel = mongoose.model<IProjectDocument>('Project', ProjectSchema);
