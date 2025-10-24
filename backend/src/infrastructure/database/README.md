# Database Layer - MongoDB + Mongoose

Modern, secure, and scalable database layer for AKCity Construction Management System.

## 🏗️ Architecture

This database layer follows **Clean Architecture** principles with clear separation of concerns:

```
database/
├── models/           # Mongoose models
├── repositories/     # Data access implementations
├── migrations/       # Database migrations
├── seeders/         # Database seeding
├── indexes/         # Database indexes
└── connection.ts    # Database connection
```

## 🚀 Features

### Database Models
- **User Model** - User management with roles and permissions
- **Project Model** - Construction project management
- **Task Model** - Task and workflow management
- **Optimized Indexes** - Performance-optimized database indexes
- **Data Validation** - Comprehensive input validation
- **Virtual Fields** - Computed properties and relationships

### Security Features
- **Password Hashing** - bcrypt with configurable rounds
- **Input Validation** - Mongoose schema validation
- **Data Sanitization** - Automatic data cleaning
- **Access Control** - Role-based data access
- **Audit Trail** - Created/updated timestamps

### Performance Features
- **Indexing Strategy** - Optimized database indexes
- **Query Optimization** - Efficient database queries
- **Connection Pooling** - MongoDB connection management
- **Caching** - Query result caching
- **Aggregation** - Complex data aggregation

## 🛠️ Getting Started

### Prerequisites
- MongoDB 4.4+
- Node.js 18+
- npm 9+

### Database Connection

```typescript
import { databaseInitializer } from './infrastructure/database/init';

// Initialize database
await databaseInitializer.initialize();
```

### Environment Variables

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/akcity_v2
MONGODB_TEST_URI=mongodb://localhost:27017/akcity_v2_test

# Security
BCRYPT_ROUNDS=12

# Seeding
SEED_DATABASE=true
```

## 📊 Database Models

### User Model

```typescript
interface IUserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  lastLogin?: Date;
  projects: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Features:**
- Password hashing with bcrypt
- Role-based access control
- Email uniqueness validation
- Phone number validation
- Project relationships
- Text search capabilities

### Project Model

```typescript
interface IProjectDocument {
  _id: ObjectId;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  progress: number;
  projectManager: ObjectId;
  team: ObjectId[];
  buildingInfo: IBuildingInfo;
  client: IClientInfo;
  documents?: ProjectDocument[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Features:**
- Date validation (end > start)
- Progress tracking (0-100%)
- Team management
- Building information
- Client information
- Document attachments

### Task Model

```typescript
interface ITaskDocument {
  _id: ObjectId;
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
  location: ITaskLocation;
  attachments: ITaskAttachment[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Features:**
- Priority levels (low, medium, high, urgent)
- Status tracking (pending, in_progress, completed, cancelled)
- Time tracking (estimated vs actual hours)
- Location tracking (block, floor, apartment)
- File attachments
- Tag system

## 🔧 Database Operations

### Migrations

```bash
# Run migrations
npm run migrate

# Check migration status
npm run migrate:status
```

### Seeding

```bash
# Seed database
npm run seed

# Clear database
npm run seed:clear
```

### Indexes

```bash
# Create indexes
npm run db:index

# Drop indexes
npm run db:drop-index
```

## 📈 Performance Optimization

### Indexing Strategy

**User Indexes:**
- Email (unique)
- Role + Status
- Created date
- Text search (name, email, phone)

**Project Indexes:**
- Status + Progress
- Project Manager + Status
- Start/End dates
- Text search (name, description, location)

**Task Indexes:**
- Project + Status
- Assigned To + Status
- Due Date + Status
- Priority + Status
- Text search (title, description, tags)

### Query Optimization

```typescript
// Efficient user queries
const users = await UserModel.find({ role: 'worker' })
  .select('name email role status')
  .limit(10)
  .sort({ createdAt: -1 });

// Efficient project queries
const projects = await ProjectModel.find({ status: 'in_progress' })
  .populate('projectManager', 'name email')
  .populate('team', 'name role')
  .sort({ endDate: 1 });

// Efficient task queries
const tasks = await TaskModel.find({ 
  project: projectId,
  status: { $in: ['pending', 'in_progress'] }
})
.populate('assignedTo', 'name email')
.sort({ priority: -1, dueDate: 1 });
```

## 🔒 Security Features

### Data Validation

```typescript
// Email validation
email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
}

// Password validation
password: {
  type: String,
  required: true,
  minlength: 8,
  select: false // Don't include in queries by default
}
```

### Access Control

```typescript
// Role-based queries
const canAccessProject = (userRole: string, projectManager: ObjectId) => {
  const allowedRoles = ['general_manager', 'project_manager'];
  return allowedRoles.includes(userRole) || user._id.equals(projectManager);
};
```

## 📊 Analytics & Reporting

### Aggregation Queries

```typescript
// User statistics
const userStats = await UserModel.aggregate([
  { $group: { _id: '$role', count: { $sum: 1 } } }
]);

// Project statistics
const projectStats = await ProjectModel.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 }, avgProgress: { $avg: '$progress' } } }
]);

// Task statistics
const taskStats = await TaskModel.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 }, avgHours: { $avg: '$actualHours' } } }
]);
```

## 🧪 Testing

### Test Database Setup

```typescript
// Test database configuration
const testConfig = {
  uri: process.env.MONGODB_TEST_URI,
  options: {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
  }
};
```

### Test Data Seeding

```typescript
// Seed test data
beforeEach(async () => {
  await DatabaseSeeder.getInstance().seed();
});

// Clean test data
afterEach(async () => {
  await DatabaseSeeder.getInstance().clear();
});
```

## 🚀 Production Deployment

### Database Configuration

```bash
# Production MongoDB URI
MONGODB_URI=mongodb://username:password@host:port/database?authSource=admin

# Connection options
DB_MAX_POOL_SIZE=20
DB_SERVER_SELECTION_TIMEOUT=5000
DB_SOCKET_TIMEOUT=45000
```

### Monitoring

```typescript
// Health check
const health = await databaseInitializer.healthCheck();
console.log('Database status:', health.status);
```

## 📄 License

MIT License - see LICENSE file for details.
