import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private transporter: Transporter | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly uploadService: UploadService,
  ) {}

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
      from: options.from ?? this.configService.get<string>('MAIL_FROM'),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  public async sendPasswordResetEmail(
    to: string,
    resetLink: string,
  ): Promise<void> {
    const logoUrl = await this.uploadService.getLogoUrl();

    await this.sendMail({
      to,
      subject: 'Reset your Hirely password',
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="${logoUrl}" alt="Hirely Logo" style="max-width: 150px; height: auto;" />
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Hi there,
          </p>
          
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            You requested a password reset for your Hirely account. Click the button below to reset your password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a
              href="${resetLink}"
              style="
                display: inline-block;
                padding: 14px 32px;
                background: #667eea;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
              "
            >
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 14px;">
          <p style="margin: 0;">Best regards,<br />The Hirely Team</p>
        </div>
      </div>
    `,
    });
  }
  public async sendMatchingJobEmail(
    jobId: string,
    jobTitle: string,
    jobDescription: string,
    candidateName: string,
    candidateEmail: string,
  ): Promise<void> {
    const jobLink = `${process.env.FRONTEND_URL}/jobs/${jobId}`;
    const logoUrl = await this.uploadService.getLogoUrl();

    await this.sendMail({
      to: candidateEmail,
      subject: `A new job matches your profile: ${jobTitle}`,
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="${logoUrl}" alt="Hirely Logo" style="max-width: 150px; height: auto;" />
        </div>
        
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">New Job Match Found! 🎉</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Hi ${candidateName},
          </p>
          
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Great news! We found a job that matches your profile perfectly. This could be your next career opportunity!
          </p>
          
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h2 style="color: #111827; margin: 0 0 10px 0; font-size: 22px;">${jobTitle}</h2>
            <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">${jobDescription}</p>
          </div>
          
          <p style="color: #374151; font-size: 16px; margin: 20px 0;">
            Click the button below to view the full job details and apply.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a
              href="${jobLink}"
              style="
                display: inline-block;
                padding: 14px 32px;
                background: #10b981;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
              "
            >
              View Job & Apply
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            Don't miss out on this opportunity! Apply today.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 14px;">
          <p style="margin: 0;">Best of luck,<br />The Hirely Team</p>
        </div>
      </div>
    `,
    });
  }

  public async sendInterviewFeedbackEmail(
    candidateName: string,
    candidateEmail: string,
    jobTitle: string,
    overallScore: number,
    conclusion: string,
    feedback: string,
  ): Promise<void> {
    const logoUrl = await this.uploadService.getLogoUrl();

    await this.sendMail({
      to: candidateEmail,
      subject: `Your Interview Feedback for ${jobTitle}`,
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <img src="${logoUrl}" alt="Hirely Logo" style="max-width: 150px; height: auto;" />
        </div>
        
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Interview Feedback Available 📊</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Hi ${candidateName},
          </p>
          
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Your interview for <strong>${jobTitle}</strong> has been analyzed. Here's your feedback:
          </p>
          
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h2 style="color: #111827; margin: 0 0 10px 0; font-size: 22px;">Overall Score: ${overallScore.toFixed(1)}/100</h2>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">Summary</h3>
            <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.6;">${conclusion}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">Detailed Feedback</h3>
            <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.6; white-space: pre-wrap;">${feedback}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            Use this feedback to improve your future interviews. Good luck!
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 14px;">
          <p style="margin: 0;">Best regards,<br />The Hirely Team</p>
        </div>
      </div>
    `,
    });
  }
}
