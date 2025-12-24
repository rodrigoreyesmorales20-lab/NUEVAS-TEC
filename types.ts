
export interface Rating {
  id?: number;
  nombre: string;
  puntuacion: number;
  created_at?: string;
  coach_comment?: string;
}

export interface SupabaseConfig {
  url: string;
  key: string;
}
