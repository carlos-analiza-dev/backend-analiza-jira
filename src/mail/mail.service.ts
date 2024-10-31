import { BadRequestException, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(correo: string) {
    if (!correo) throw new BadRequestException('No se proporciono un correo');

    try {
      await this.mailerService.sendMail({
        to: correo,
        subject: 'Cambiar Contraseña',
        template: './confirm-password',
        context: {
          resetUrl: `${process.env.FRONTEND_URL}/comfirm-password`,
        },
      });

      return { message: 'Password reset email sent' };
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }

  async sendEmailConfirm(email: string, newPassword: string) {
    if (!email) throw new BadRequestException('No se proporcionó un correo');

    const resetUrl = `${process.env.FRONTEND_URL}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Contraseña Actualizada',
        template: './confirm-correo',
        context: {
          resetUrl,
          email,
          newPassword,
        },
      });

      return { message: 'Correo de confirmación enviado' };
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }
}
