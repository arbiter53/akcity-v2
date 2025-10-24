export interface WelcomeEmailData {
  to: string;
  name: string;
  role: string;
}

export interface PasswordResetEmailData {
  to: string;
  name: string;
  resetToken: string;
}

export interface IEmailService {
  sendWelcomeEmail(data: WelcomeEmailData): Promise<void>;
  sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void>;
  sendNotificationEmail(to: string, subject: string, content: string): Promise<void>;
}
