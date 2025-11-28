import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'app-editar-perfil-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './editar-perfil-dialog.html',
  styleUrl: './editar-perfil-dialog.css'
})
export class EditarPerfilDialogComponent {
  nombre: string;
  email: string;
  nuevaContrasena: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditarPerfilDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {
    this.nombre = data.nombre;
    this.email = data.email;
  }

  guardar() {
    const datosActualizados: any = {
      id: this.data.id,
      nombre: this.nombre,
      email: this.email,
    };

    // Solo incluir contraseña si se ha introducido una nueva
    if (this.nuevaContrasena && this.nuevaContrasena.trim() !== '') {
      datosActualizados.contrasena = this.nuevaContrasena;
    }

    // Actualizar en el backend
    this.http.put(`http://localhost:8081/api/usuarios/${this.data.id}`, datosActualizados)
      .subscribe({
        next: (usuario) => {
          console.log('✅ Usuario actualizado:', usuario);

          // Actualizar localStorage
          localStorage.setItem('usuario', JSON.stringify(usuario));

          this.dialogRef.close(usuario);
        },
        error: (err) => {
          console.error('❌ Error al actualizar usuario:', err);
          alert('Error al actualizar el perfil');
        }
      });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
