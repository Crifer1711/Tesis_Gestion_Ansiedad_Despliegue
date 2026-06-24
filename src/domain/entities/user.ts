export interface User {
  id?: string;
  email: string;
  password?: string;
  name: string;
  lastname: string;
  // Actualizamos los roles para incluir 'ESTUDIANTE' que aparece en tu DB
  role: 'PACIENTE' | 'PSICOLOGO' | 'ADMINISTRADOR';
  // Nuevos campos requeridos por la estructura de tu tabla
  contacto: string;
  status: string;
  especialidad: string | null;
  verificationToken?: string | null;
  verificationTokenExpiresAt?: Date | null;
  emailVerifiedAt?: Date | null;
}