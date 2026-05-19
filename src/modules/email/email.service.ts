import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getTransporter(): Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!host || !port || !user || !pass) {
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });

    return this.transporter;
  }

  async sendPasswordResetEmail(
    to: string,
    resetLink: string,
  ): Promise<void> {
    const from =
      this.configService.get<string>('MAIL_FROM') ?? 'noreply@hirely.com';
    const subject = 'Reset your Hirely password';
    const html = `
      <p>You requested a password reset for your Hirely account.</p>
      <p><a href="${resetLink}">Click here to set a new password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `;

    const transporter = this.getTransporter();

    if (!transporter) {
      this.logger.warn(
        `SMTP not configured. Password reset link for ${to}: ${resetLink}`,
      );
      return;
    }

    await transporter.sendMail({ from, to, subject, html });
  }
}
