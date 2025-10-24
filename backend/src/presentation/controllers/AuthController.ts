import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../core/use-cases/CreateUserUseCase';
import { AuthenticateUserUseCase } from '../../core/use-cases/AuthenticateUserUseCase';
import { CreateUserDto, createUserSchema } from '../../application/dto/CreateUserDto';
import { LoginDto, loginSchema } from '../../application/dto/LoginDto';
import { IUserRepository } from '../../core/interfaces/IUserRepository';
import { IHashService } from '../../core/interfaces/IHashService';
import { ITokenService } from '../../core/interfaces/ITokenService';
import { IEmailService } from '../../core/interfaces/IEmailService';

export class AuthController {
  private createUserUseCase: CreateUserUseCase;
  private authenticateUserUseCase: AuthenticateUserUseCase;

  constructor(
    userRepository: IUserRepository,
    hashService: IHashService,
    tokenService: ITokenService,
    emailService: IEmailService
  ) {
    this.createUserUseCase = new CreateUserUseCase(userRepository, hashService, emailService);
    this.authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, hashService, tokenService);
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = createUserSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const createUserDto: CreateUserDto = value;
      const result = await this.createUserUseCase.execute(createUserDto);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'User created successfully',
          data: {
            user: result.user?.toJSON()
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const loginDto: LoginDto = value;
      const result = await this.authenticateUserUseCase.execute(loginDto);

      if (result.success) {
        res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
        return;
      }

      // TODO: Implement refresh token logic
      res.status(501).json({
        success: false,
        message: 'Refresh token endpoint not implemented yet'
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implement logout logic (token blacklisting)
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
