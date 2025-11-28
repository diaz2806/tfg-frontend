export interface Gasto {
  id?: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  fecha: string;
  recurrente: boolean;
  frecuencia?: 'mensual' | 'semanal' | 'anual' | null;
  usuario?: { id: number };
  categoria: { id: number };
}

