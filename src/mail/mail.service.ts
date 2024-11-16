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

  async sendEmailConfirmProject(
    correo: string,
    nombre: string,
    proyecto: string
  ) {
    if (!correo) throw new BadRequestException('No se proporciono un correo');

    try {
      await this.mailerService.sendMail({
        to: correo,
        subject: 'Confirmar Proyecto',
        template: './confirm-proyecto',
        context: {
          nombre,
          proyecto,
        },
      });

      return { message: 'Correo de confirmación enviado' };
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }

  async sendEmailConfirmEvento(correo: string, nombre: string, evento: string) {
    if (!correo) throw new BadRequestException('No se proporciono un correo');

    try {
      await this.mailerService.sendMail({
        to: correo,
        subject: 'Confirmar Evento',
        template: './confirm-evento',
        context: {
          nombre,
          evento,
        },
      });

      return { message: 'Correo de confirmación enviado' };
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }
  async sendEmailAceptProyecto(
    correo: string,
    nombre: string,
    resName: string,
    proyecto: string
  ) {
    if (!correo) throw new BadRequestException('No se proporciono un correo');

    try {
      await this.mailerService.sendMail({
        to: correo,
        subject: 'Proyecto Aceptado',
        template: './acept-proyecto',
        context: {
          nombre,
          proyecto,
          resName,
        },
      });

      return { message: 'Correo de confirmación enviado' };
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }

  async sendEmailRejectProyecto(
    correo: string,
    nombre: string,
    resName: string,
    proyecto: string
  ) {
    if (!correo) throw new BadRequestException('No se proporciono un correo');

    try {
      await this.mailerService.sendMail({
        to: correo,
        subject: 'Proyecto Rechazado',
        template: './rejected-proyecto',
        context: {
          nombre,
          proyecto,
          resName,
        },
      });

      return { message: 'Correo de confirmación enviado' };
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }

  async sendEmailAceptEvento(
    correo: string,
    nombre: string,
    resName: string,
    evento: string
  ) {
    if (!correo) throw new BadRequestException('No se proporciono un correo');

    try {
      await this.mailerService.sendMail({
        to: correo,
        subject: 'Evento Aceptado',
        template: './acept-evento',
        context: {
          nombre,
          evento,
          resName,
        },
      });

      return { message: 'Correo de confirmación enviado' };
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }

  async sendEmailRejectEvento(
    correo: string,
    nombre: string,
    resName: string,
    evento: string
  ) {
    if (!correo) throw new BadRequestException('No se proporciono un correo');

    try {
      await this.mailerService.sendMail({
        to: correo,
        subject: 'Evento Rechazado',
        template: './rejected-evento',
        context: {
          nombre,
          evento,
          resName,
        },
      });

      return { message: 'Correo de confirmación enviado' };
    } catch (error) {
      throw new Error('Failed to send email');
    }
  }
}
