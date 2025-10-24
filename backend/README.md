# AKCity Backend API v2.0

Modern, secure, and scalable backend API for construction management system built with TypeScript and Clean Architecture.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── core/                    # Domain layer (business logic)
│   ├── entities/           # Business entities
│   ├── use-cases/          # Business use cases
│   └── interfaces/         # Repository and service contracts
├── infrastructure/         # Infrastructure layer
│   ├── database/          # Data access implementations
│   ├── security/          # Authentication & encryption
│   └── external/          # External service integrations
├── application/            # Application layer
│   ├── dto/               # Data transfer objects
│   ├── services/          # Application services
│   └── middleware/        # Cross-cutting concerns
└── presentation/           # Presentation layer
    ├── controllers/       # HTTP request handlers
    ├── routes/           # Route definitions
    └── middleware/       # Request processing
```

## 🚀 Features

### Security
- **JWT Authentication** with refresh tokens
- **Role-based access control** (RBAC)
- **Rate limiting** and DDoS protection
- **Input validation** with Joi schemas
- **Password hashing** with bcrypt
- **CORS** and security headers
- **XSS protection** and SQL injection prevention

### Architecture
- **Clean Architecture** with dependency inversion
- **Repository pattern** for data access
- **Use case pattern** for business logic
- **DTO pattern** for data transfer
- **Interface segregation** for testability

### Development
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality
- **Jest** for testing
- **Nodemon** for development
- **Environment-based configuration**

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Redis (optional, for caching)

### Installation

1. **Clone and install dependencies**
```bash
cd backend
npm install
```

2. **Environment setup**
```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Development**
```bash
npm run dev
```

4. **Production build**
```bash
npm run build
npm start
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/v1/auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "role": "project_manager"
}
```

#### POST /api/v1/auth/login
Authenticate user and get tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### Security Features

#### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **File Upload**: 5 uploads per minute

#### Password Requirements
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character

#### JWT Tokens
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry
- **Secure headers**: Issuer and audience validation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🔧 Development

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

### Database
```bash
# Run migrations
npm run migrate

# Seed database
npm run seed
```

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/akcity_v2

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
```

### Docker Deployment
```bash
# Build image
docker build -t akcity-backend .

# Run container
docker run -p 5000:5000 --env-file .env akcity-backend
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

### Metrics
- Server uptime
- Request count
- Error rate
- Response time

## 🔒 Security Checklist

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Rate limiting and DDoS protection
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Security headers (Helmet)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Role-based access control
- ✅ Environment variable security

## 🤝 Contributing

1. Follow Clean Architecture principles
2. Write tests for new features
3. Use TypeScript strict mode
4. Follow ESLint and Prettier rules
5. Document your code
6. Update README if needed

## 📄 License

MIT License - see LICENSE file for details.
