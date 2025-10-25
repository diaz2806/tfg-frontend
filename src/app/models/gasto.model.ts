export interface Gasto {
  id?: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  cantidad: number;
  fecha: string;
  recurrente: boolean;
  frecuencia?: 'puntual' | 'semanal' | 'mensual' | 'anual';
}

