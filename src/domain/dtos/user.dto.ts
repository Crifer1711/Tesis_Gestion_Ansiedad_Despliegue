export interface User {
  id: string | number;
  name: string;
  lastname?: string;
  email: string;
  password: string;
  role: 'PACIENTE' | 'PSICOLOGO' | 'ADMINISTRADOR';
  status?: string;
}