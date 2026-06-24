// Usa Resend HTTP API (sin SMTP, sin timeouts de red)
const getBaseUrl = () =>
  process.env.NEXTAUTH_URL || process.env.APP_BASE_URL || 'http://localhost:3000';

export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${getBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const apiKey = (process.env.RESEND_API_KEY || '').trim();

  if (!apiKey) {
    console.info('[Verification Email] RESEND_API_KEY not set. Verification URL:', verifyUrl);
    return;
  }

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

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'MindPeace <onboarding@resend.dev>',
      to: [email],
      subject: 'Verifica tu cuenta de MindPeace',
      html,
      text: `Activa tu cuenta de MindPeace: ${verifyUrl}`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[Verification Email] Resend API error:', res.status, body);
    throw new Error(`Resend error ${res.status}: ${body}`);
  }

  const data = await res.json();
  console.info('[Verification Email] Sent via Resend, id:', data.id);
};
