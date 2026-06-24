export interface Activity {
  id: string | number;
  nombre: string;
  categoria: 'Respiración' | 'Visualizacion' | 'Sonidos' | 'Interaccion' | 'Todos';
  duracion: string;
  usos: 'asignar' | 'tecnicas';
  descripcion?: string;
  estado: 'Aprobada' | 'Pendiente' | 'Rechazada' | 'Inactivo' | 'Activo';
  embed_url?: string | null;
}