import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-anadir-evento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './anadir-evento-dialog.html',
  styleUrls: ['./anadir-evento-dialog.css'],
})
export class AnadirEventoDialogComponent implements OnInit {
  titulo = '';
  descripcion = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  horaInicio = '';
  horaFin = '';
  categoria: any = null;
  conGasto = false;
  cantidad?: number;
  categorias: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<AnadirEventoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit() {
    // 🔹 Cargar categorías desde backend
    this.categoriaService.obtenerCategorias().subscribe({
      next: (cats) => {
        this.categorias = cats;

        // ✅ Si estamos editando y hay categoría, encontrarla en la lista
        if (this.data?.categoria) {
          this.categoria = this.categorias.find((c) => c.id === this.data.categoria.id) || null;
        }
      },
      error: (err) => console.error('Error al cargar categorías:', err),
    });

    // 🔹 Si estamos editando, precargar datos
    if (this.data) {
      this.titulo = this.data.title || '';
      this.descripcion = this.data.descripcion || '';
      this.conGasto = this.data.conGasto || false;
      this.cantidad = this.data.cantidad || undefined;

      // ✅ Manejar fechas correctamente
      if (this.data.start) {
        this.fechaInicio = new Date(this.data.start);
        const h = this.fechaInicio.getHours().toString().padStart(2, '0');
        const m = this.fechaInicio.getMinutes().toString().padStart(2, '0');
        this.horaInicio = `${h}:${m}`;
      }

      if (this.data.end) {
        this.fechaFin = new Date(this.data.end);
        const h = this.fechaFin.getHours().toString().padStart(2, '0');
        const m = this.fechaFin.getMinutes().toString().padStart(2, '0');
        this.horaFin = `${h}:${m}`;
      }
    }
  }

  guardar() {
    // 🔹 Combinar fecha y hora
    let start: Date | null = null;
    let end: Date | null = null;

    if (this.fechaInicio) {
      if (this.horaInicio) {
        // Si hay hora específica, combinar fecha + hora
        start = this.combinarFechaHora(this.fechaInicio, this.horaInicio);
      } else {
        // Si NO hay hora, es un evento de todo el día
        start = new Date(this.fechaInicio);
        start.setHours(0, 0, 0, 0);
      }
    }

    if (this.fechaFin) {
      if (this.horaFin) {
        end = this.combinarFechaHora(this.fechaFin, this.horaFin);
      } else {
        end = new Date(this.fechaFin);
        end.setHours(23, 59, 59, 999); // Final del día
      }
    }

    this.dialogRef.close({
      id: this.data?.id,
      title: this.titulo,
      start: start?.toISOString(),
      end: end?.toISOString(),
      descripcion: this.descripcion,
      categoriaId: this.categoria?.id || 1,
      conGasto: this.conGasto,
      cantidad: this.conGasto ? this.cantidad || 0 : 0,
      allDay: !this.horaInicio && !this.horaFin, // ✅ Marcar si es evento de todo el día
    });
  }

  combinarFechaHora(fecha: Date | null, hora: string): Date | null {
    if (!fecha) return null;
    if (!hora) return fecha;

    const [h, m] = hora.split(':').map(Number);
    const nueva = new Date(fecha);
    nueva.setHours(h, m, 0, 0);
    return nueva;
  }

  eliminar() {
    if (confirm('¿Seguro que deseas eliminar este evento?')) {
      this.dialogRef.close({ eliminar: true, id: this.data?.id });
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
