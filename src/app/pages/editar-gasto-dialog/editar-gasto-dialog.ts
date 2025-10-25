import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Gasto } from '../../models/gasto.model';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-editar-gasto-dialog',
  styleUrl: './editar-gasto-dialog.css',
  templateUrl: './editar-gasto-dialog.html',
  imports: [
    MatDialogActions,
    MatInputModule,
    MatDialogContent,
    ReactiveFormsModule,
    MatSelectModule,
  ],
})
export class EditarGastoDialogComponent {
  gastoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditarGastoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Gasto
  ) {
    this.gastoForm = this.fb.group({
      id: [data.id],
      nombre: [data.nombre, Validators.required],
      categoria: [data.categoria, Validators.required],
      descripcion: [data.descripcion],
      cantidad: [data.cantidad, [Validators.required, Validators.min(0.01)]],
      fecha: [data.fecha, Validators.required],
      recurrente: [data.recurrente],
      frecuencia: [data.frecuencia],
    });
  }

  categorias: string[] = ['Alimentación', 'Transporte', 'Vivienda', 'Ocio', 'Otros'];

  guardar(): void {
    if (this.gastoForm.valid) {
      const gastoEditado = { ...this.data, ...this.gastoForm.value };
      this.dialogRef.close(gastoEditado);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
