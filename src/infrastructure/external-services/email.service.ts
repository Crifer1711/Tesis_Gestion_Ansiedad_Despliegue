import nodemailer from 'nodemailer';

const getBaseUrl = () =>
  process.env.NEXTAUTH_URL || process.env.APP_BASE_URL || 'http://localhost:3000';

export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${getBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASS?.replace(/\s/g, '');

  if (!host || !user || !password || !Number.isInteger(port)) {
    throw new Error('SMTP configuration is incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

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
    const response = await transporter.sendMail({
      to: email,
      from: { address: user, name: 'MindPeace' },
      subject: 'Verifica tu cuenta de MindPeace',
      html: html,
      text: `Activa tu cuenta de MindPeace: ${verifyUrl}`,
    });

    console.info('[Verification Email] Sent via SMTP:', response.messageId);
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Verification Email] SMTP error:', message);
    throw new Error(`SMTP error: ${message}`);
  }
};