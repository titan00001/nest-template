import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';
import sendgrid from '@sendgrid/mail';
import { BusinessError } from 'nest-common';

@Injectable()
export class EmailService {
	constructor(private readonly config: ConfigService) {
		sendgrid.setApiKey(this.config.get('SENDGRID_API_KEY'));
	}

	async sendPasswordResetEmail(recipient: string, token: string) {
		const body = `
      <p>Hello,</p>
      <p>You have requested to reset your password. Please use the following token to reset your password:</p>
      <p><strong>${token}</strong></p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>Thank you,</p>
      <p>The Kasi Team</p>
    `;

		const mail: MailDataRequired = {
			to: recipient,
			from: {
				email: 'noreply@mayavee.ai',
				name: 'Mayavee',
			},
			subject: 'Kasi: Password Reset',
			html: body,
		};

		try {
			await sendgrid.send(mail);
		} catch (error) {
			console.log({ error });
			throw new BusinessError('INTERNAL_SERVER_ERROR', 'Failed to send password reset email');
		}
	}

	async sendCoachPasswordResetEmail(recipient: string, token: string) {
		const domain = this.config.get<string>('CLIENT_URL');
		const resetLink = `${domain}/reset-password?token=${token}`;
		const body = `
      <p>Hello,</p>
      <p>You have requested to reset your password. Please use the following link to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>Thank you,</p>
      <p>The Kasi Team</p>
    `;

		const mail: MailDataRequired = {
			to: recipient,
			from: {
				email: 'noreply@mayavee.ai',
				name: 'Mayavee',
			},
			subject: 'Kasi: Coach Password Reset',
			html: body,
		};

		try {
			await sendgrid.send(mail);
		} catch (error) {
			console.log({ error });
			throw new BusinessError('INTERNAL_SERVER_ERROR', 'Failed to send password reset email');
		}
	}

	async sendAlternateInvoice(recipient: string, invoiceUrl: string) {
		const body = `
      <p>Hello,</p>
      <p>We have generated a new invoice for your recent purchase. Please use the following link to view and pay your invoice:</p>
      <p><a href="${invoiceUrl}"><strong>View Invoice</strong></a></p>
      <p>If you have any questions or need assistance, feel free to contact our support team.</p>
      <p>Thank you for your business!</p>
      <p>Best regards,</p>
      <p>The Kasi Team</p>
    `;

		const mail: MailDataRequired = {
			to: recipient,
			from: {
				email: 'noreply@mayavee.ai',
				name: 'Mayavee',
			},
			subject: 'Kasi: Pay against invoice',
			html: body,
		};

		try {
			await sendgrid.send(mail);
		} catch (error) {
			console.log({ error });
			throw new BusinessError('INTERNAL_SERVER_ERROR', 'Failed to send password reset email');
		}
	}
}
