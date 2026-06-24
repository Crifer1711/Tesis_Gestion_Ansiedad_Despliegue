import nodemailer from 'nodemailer';

const EMAIL_SEND_TIMEOUT_MS = 8000;

const getBaseUrl = () => {
  return process.env.NEXTAUTH_URL || process.env.APP_BASE_URL || 'http://localhost:3000';
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${getBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const host = (process.env.SMTP_HOST || '').trim();
  const configuredPort = Number((process.env.SMTP_PORT || '587').trim());
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const from = (process.env.SMTP_FROM || 'MindPeace <no-reply@mindpeace.local>').trim();

  // Development fallback: if SMTP is not configured, we log the URL and continue.
  if (!host || !user || !pass) {
    console.info('[Verification Email] SMTP not configured. Share this URL manually:', verifyUrl);
    return;
  }

  if (!user.includes('@')) {
    console.error('[Verification Email] Invalid SMTP_USER format. Expected an email address.');
    throw new Error('Invalid SMTP_USER format');
  }

  if (!from.includes('@')) {
    console.error('[Verification Email] Invalid SMTP_FROM format. Expected an email address.');
    throw new Error('Invalid SMTP_FROM format');
  }

  const message = {
    from,
    to: email,
    subject: 'Verifica tu cuenta de MindPeace',
    html: `
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
    `,
    text: `Activa tu cuenta de MindPeace con este enlace: ${verifyUrl}`,
  };

  const sendWithPort = async (port: number, secure: boolean) => {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: EMAIL_SEND_TIMEOUT_MS,
      greetingTimeout: EMAIL_SEND_TIMEOUT_MS,
      socketTimeout: EMAIL_SEND_TIMEOUT_MS,
      tls: { servername: host },
    });

    await transporter.sendMail(message);
  };

  try {
    await sendWithPort(configuredPort, configuredPort === 465);
  } catch (firstError) {
    const msg = firstError instanceof Error ? firstError.message : String(firstError);
    const isTimeout = /timeout/i.test(msg);

    if (!isTimeout) {
      throw firstError;
    }

    const fallbackPort = configuredPort === 465 ? 587 : 465;
    const fallbackSecure = fallbackPort === 465;

    console.warn(`[Verification Email] SMTP timeout on port ${configuredPort}. Retrying on ${fallbackPort}...`);
    await sendWithPort(fallbackPort, fallbackSecure);
  }
};
