
export interface UsuarioRef {
  id: number;
}

export interface CategoriaRef {
  id: number;
  nombre?: string;
  color?: string;
}

export interface Evento {
  id?: number;
  titulo: string;
  descripcion?: string | null;
  fechaInicio: string;
  fechaFin?: string | null;
  conGasto: boolean;
  cantidad?: number | null;
  backgroundColor?: string;
  usuario?: UsuarioRef;
  categoria?: CategoriaRef | string;
}
