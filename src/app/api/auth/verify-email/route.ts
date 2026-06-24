import { NextResponse } from 'next/server';
import pool from '@/infrastructure/database/db';

const getBaseUrl = () => process.env.NEXTAUTH_URL || process.env.APP_BASE_URL || 'http://localhost:3000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${getBaseUrl()}/login?verify=invalid`);
    }

    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP');

    const userRes = await pool.query(
      `SELECT id, verification_token_expires_at
       FROM users
       WHERE verification_token = $1
       LIMIT 1`,
      [token]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.redirect(`${getBaseUrl()}/login?verify=invalid`);
    }

    const user = userRes.rows[0];
    const expiresAt = user.verification_token_expires_at ? new Date(user.verification_token_expires_at) : null;

    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      return NextResponse.redirect(`${getBaseUrl()}/login?verify=expired`);
    }

    await pool.query(
      `UPDATE users
       SET status = 'activo',
           email_verified_at = NOW(),
           verification_token = NULL,
           verification_token_expires_at = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    return NextResponse.redirect(`${getBaseUrl()}/login?verify=success`);
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.redirect(`${getBaseUrl()}/login?verify=error`);
  }
}
