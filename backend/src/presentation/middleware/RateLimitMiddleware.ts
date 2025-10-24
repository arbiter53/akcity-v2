import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

export class RateLimitMiddleware {
  static createGeneralLimiter() {
    return rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          message: 'Too many requests from this IP, please try again later.',
          retryAfter: Math.round(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
        });
      }
    });
  }

  static createAuthLimiter() {
    return rateLimit({
      windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW || '15') * 60 * 1000, // 15 minutes
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'), // limit each IP to 5 requests per windowMs
      message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true, // Don't count successful requests
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          message: 'Too many authentication attempts, please try again later.',
          retryAfter: Math.round(parseInt(process.env.AUTH_RATE_LIMIT_WINDOW || '15') * 60)
        });
      }
    });
  }

  static createStrictLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10, // limit each IP to 10 requests per minute
      message: {
        success: false,
        message: 'Too many requests, please slow down.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          message: 'Too many requests, please slow down.',
          retryAfter: 60
        });
      }
    });
  }

  static createFileUploadLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 5, // limit each IP to 5 file uploads per minute
      message: {
        success: false,
        message: 'Too many file uploads, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          success: false,
          message: 'Too many file uploads, please try again later.',
          retryAfter: 60
        });
      }
    });
  }
}
