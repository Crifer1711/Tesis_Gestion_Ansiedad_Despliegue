// src/domain/entities/user.ts
export interface User {
  id?: string | number;
  email: string;
  password?: string;
  name: string;
  lastname: string;
  role: 'PACIENTE' | 'PSICOLOGO' | 'ADMINISTRADOR';
  contacto?: string;
  status: string;
  especialidad?: string | null;
  verificationToken?: string | null;
  verificationTokenExpiresAt?: Date | null;
  emailVerifiedAt?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date;
}