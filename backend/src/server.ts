import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { AuthController } from './presentation/controllers/AuthController';
import { RateLimitMiddleware } from './presentation/middleware/RateLimitMiddleware';
import { BcryptHashService } from './infrastructure/security/BcryptHashService';
import { JwtTokenService } from './infrastructure/security/JwtTokenService';

// Load environment variables
dotenv.config();

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5000');
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: process.env.CORS_CREDENTIALS === 'true',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    this.app.use(RateLimitMiddleware.createGeneralLimiter());
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // API routes
    const apiPrefix = process.env.API_PREFIX || '/api';
    const apiVersion = process.env.API_VERSION || 'v1';
    
    // Initialize services (in a real app, these would be injected via DI container)
    const hashService = new BcryptHashService(parseInt(process.env.BCRYPT_ROUNDS || '12'));
    const tokenService = new JwtTokenService(
      process.env.JWT_SECRET || 'fallback-secret',
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      process.env.JWT_EXPIRE || '15m',
      process.env.JWT_REFRESH_EXPIRE || '7d'
    );

    // TODO: Initialize repositories and email service
    // const userRepository = new MongoUserRepository();
    // const emailService = new NodemailerEmailService();

    // Auth routes
    // const authController = new AuthController(userRepository, hashService, tokenService, emailService);
    
    this.app.use(`${apiPrefix}/${apiVersion}/auth`, (req, res) => {
      res.status(501).json({
        success: false,
        message: 'Auth endpoints not implemented yet'
      });
    });

    // Protected routes
    this.app.use(`${apiPrefix}/${apiVersion}/users`, (req, res) => {
      res.status(501).json({
        success: false,
        message: 'User endpoints not implemented yet'
      });
    });

    this.app.use(`${apiPrefix}/${apiVersion}/projects`, (req, res) => {
      res.status(501).json({
        success: false,
        message: 'Project endpoints not implemented yet'
      });
    });

    this.app.use(`${apiPrefix}/${apiVersion}/tasks`, (req, res) => {
      res.status(501).json({
        success: false,
        message: 'Task endpoints not implemented yet'
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Global error handler:', error);
      
      res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message
      });
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server running on port ${this.port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${this.port}/health`);
    });
  }
}

// Start server
const server = new Server();
server.start();

export default server;
