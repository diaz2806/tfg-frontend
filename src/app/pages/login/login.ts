import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatCard } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [MatInputModule, FormsModule, MatProgressSpinnerModule, CommonModule, MatIconModule],
})
export class Login {
  modoLogin = true; // alterna entre login y registro
  nombre = '';
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  // 🔑 INICIAR SESIÓN
  login() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('🔍 Respuesta completa del backend:', response);
        console.log('🔍 Tipo de respuesta:', typeof response);

        try {
          const json = typeof response === 'string' ? JSON.parse(response) : response;
          console.log('✅ JSON parseado:', json);
          localStorage.setItem('user', JSON.stringify(json.usuario));
          this.router.navigate(['/dashboard']);
        } catch (error) {
          console.error('❌ Error procesando respuesta:', error);
        }
      },

      error: (err) => {
        console.error('Error en login:', err);
        this.errorMessage = 'Email o contraseña incorrectos';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  // 🧍 REGISTRAR NUEVO USUARIO
  register() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.nombre, this.email, this.password).subscribe({
      next: (response) => {
        console.log('Registro correcto:', response);
        this.errorMessage = '✅ Usuario registrado correctamente. Ahora puedes iniciar sesión.';
        this.modoLogin = true;
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.errorMessage = '❌ Error al registrar el usuario.';
      },
      complete: () => (this.loading = false),
    });
  }
}
