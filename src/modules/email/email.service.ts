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

  async sendPasswordResetEmail(
    to: string,
    resetLink: string,
  ): Promise<void> {

    await this.sendMail({
      to,
      subject:
        'Reset your Hirely password',
      html: `
        <p>
          You requested a password reset.
        </p>

        <a href="${resetLink}">
          Reset Password
        </a>
      `,
    });
  }

  private async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    const transporter = this.getTransporter();

    if (!transporter) {
      throw new Error('Transporter unavailable');
    }

    return transporter.sendMail({
      from:
        options.from ??
        this.configService.get<string>(
          'MAIL_FROM',
        ),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  public async sendRecruiterEmail(
    candidates: any[],
    subject: string,
    template: string,
    companyName: string,
  ) {
    const promises = candidates.map(
      async (candidate) => {

        const html =
          this.parseTemplate(
            template,
            {
              name: candidate.name,
              email: candidate.email,
              jobTitle:
                candidate.jobTitle,
              companyName,
            },
          );

        return this.sendMail({
          to: candidate.email,

          subject,

          from: `${companyName} Recruitment <${this.configService.get('MAIL_FROM')}>`,

          html,
        });
      },
    );

    await Promise.all(promises);
  }

  private parseTemplate(
    template: string,
    candidate: any,
  ) {
    return template
      .replace(
        /{{name}}/g,
        candidate.name,
      )
      .replace(
        /{{email}}/g,
        candidate.email,
      )
      .replace(
        /{{jobTitle}}/g,
        candidate.jobTitle,
      );
  }
}
