// emailservice.ts - VERSIÓN CORREGIDA CON SENDGRID
import sgMail from '@sendgrid/mail';

const getBaseUrl = () =>
  process.env.NEXTAUTH_URL || process.env.APP_BASE_URL || 'http://localhost:3000';

export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${getBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'cfloachamin@espe.edu.ec';

  if (!apiKey) {
    console.info('[Verification Email] SENDGRID_API_KEY not set. Verification URL:', verifyUrl);
    return;
  }

  sgMail.setApiKey(apiKey);

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #1E4D8C; margin-bottom: 12px;">Activa tu cuenta</h2>
      <p>Gracias por registrarte en MindPeace.</p>
      <p>Para habilitar tu cuenta, confirma tu correo institucional haciendo clic en el siguiente botón:</p>
      <p style="margin: 20px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: #1E4D8C; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 700;">Verificar mi cuenta</a>
      </p>
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p style="word-break: break-all; color: #334155;">${verifyUrl}</p>
      <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Este enlace expira en 24 horas.</p>
    </div>
  `;

  try {
    const response = await sgMail.send({
      to: email,
      from: fromEmail,
      subject: 'Verifica tu cuenta de MindPeace',
      html: html,
      text: `Activa tu cuenta de MindPeace: ${verifyUrl}`,
    });

    console.info('[Verification Email] Sent via SendGrid, response:', response);
    return response;
  } catch (error: any) {
    console.error('[Verification Email] SendGrid error:', error);
    
    if (error.response) {
      console.error('[Verification Email] SendGrid response error:', error.response.body);
    }
    
    throw new Error(`SendGrid error: ${error.message || 'Unknown error'}`);
  }
};