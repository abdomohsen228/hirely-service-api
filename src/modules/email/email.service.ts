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

    this.logger.log('Initializing SMTP transporter...');

    console.log('SMTP CONFIG:', {
      host,
      port,
      user,
      passExists: !!pass,
    });

    if (!host || !port || !user || !pass) {
      this.logger.error('SMTP environment variables are missing');

      return null;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(port),

      // 465 => true
      // 587 => false
      secure: Number(port) === 465,

      auth: {
        user,
        pass,
      },

      logger: true,
      debug: true,

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP VERIFY ERROR:', error);

        this.logger.error(
          `SMTP verify failed: ${JSON.stringify(error, null, 2)}`,
        );
      } else {
        console.log('SMTP SERVER READY');

        this.logger.log(`SMTP verify success: ${success}`);
      }
    });

    return this.transporter;
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    this.logger.log(`Preparing password reset email for: ${to}`);

    const from =
      this.configService.get<string>('MAIL_FROM') ?? 'noreply@hirely.com';

    const subject = 'Reset your Hirely password';

    const html = `
      <p>You requested a password reset for your Hirely account.</p>

      <p>
        <a href="${resetLink}">
          Click here to set a new password
        </a>
      </p>

      <p>
        This link expires in 1 hour.
        If you did not request this email, you can ignore it.
      </p>
    `;

    const transporter = this.getTransporter();

    if (!transporter) {
      this.logger.error(
        `Transporter creation failed. Reset link for ${to}: ${resetLink}`,
      );

      return;
    }

    try {
      this.logger.log(`Sending email to ${to}...`);

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent successfully`);

      console.log('EMAIL SENT INFO:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected,
        pending: info.pending,
      });
    } catch (error) {
      this.logger.error('EMAIL SEND FAILED');

      console.error('FULL EMAIL ERROR:', error);

      if (error instanceof Error) {
        console.error('ERROR MESSAGE:', error.message);

        console.error('ERROR STACK:', error.stack);
      }
    }
  }
}
