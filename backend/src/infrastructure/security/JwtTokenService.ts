import jwt from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../../core/interfaces/ITokenService';

export class JwtTokenService implements ITokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor(
    accessTokenSecret: string,
    refreshTokenSecret: string,
    accessTokenExpiry: string = '15m',
    refreshTokenExpiry: string = '7d'
  ) {
    this.accessTokenSecret = accessTokenSecret;
    this.refreshTokenSecret = refreshTokenSecret;
    this.accessTokenExpiry = accessTokenExpiry;
    this.refreshTokenExpiry = refreshTokenExpiry;
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    try {
      return jwt.sign(payload, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry,
        issuer: 'akcity-api',
        audience: 'akcity-client'
      } as jwt.SignOptions);
    } catch (error) {
      throw new Error('Failed to generate access token');
    }
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    try {
      return jwt.sign(payload, this.refreshTokenSecret, {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'akcity-api',
        audience: 'akcity-client'
      } as jwt.SignOptions);
    } catch (error) {
      throw new Error('Failed to generate refresh token');
    }
  }

  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'akcity-api',
        audience: 'akcity-client'
      }) as jwt.JwtPayload;

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'akcity-api',
        audience: 'akcity-client'
      }) as jwt.JwtPayload;

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      return null;
    }
  }

  async revokeToken(token: string): Promise<void> {
    // In a production environment, you would add the token to a blacklist
    // stored in Redis or database. For now, we'll just log it.
    console.log('Token revoked:', token);
  }
}
