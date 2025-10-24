import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '../../core/interfaces/ITokenService';
import { IUserRepository } from '../../core/interfaces/IUserRepository';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class AuthMiddleware {
  constructor(
    private tokenService: ITokenService,
    private userRepository: IUserRepository
  ) {}

  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Access token is required'
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        const payload = await this.tokenService.verifyAccessToken(token);
        
        if (!payload) {
          res.status(401).json({
            success: false,
            message: 'Invalid access token'
          });
          return;
        }

        // Verify user still exists and is active
        const user = await this.userRepository.findById(payload.userId as any);
        if (!user || user.status !== 'active') {
          res.status(401).json({
            success: false,
            message: 'User not found or inactive'
          });
          return;
        }

        req.user = {
          id: payload.userId,
          email: payload.email,
          role: payload.role || ''
        };

        next();
      } catch (tokenError) {
        res.status(401).json({
          success: false,
          message: tokenError instanceof Error ? tokenError.message : 'Invalid access token'
        });
        return;
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  };

  authorize = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
        return;
      }

      next();
    };
  };

  optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
      }

      const token = authHeader.substring(7);

      try {
        const payload = await this.tokenService.verifyAccessToken(token);
        
        if (payload) {
          const user = await this.userRepository.findById(payload.userId as any);
          if (user && user.status === 'active') {
            req.user = {
              id: payload.userId,
              email: payload.email,
              role: payload.role || ''
            };
          }
        }
      } catch (tokenError) {
        // Ignore token errors for optional auth
        console.warn('Optional auth token error:', tokenError);
      }

      next();
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      next();
    }
  };
}
