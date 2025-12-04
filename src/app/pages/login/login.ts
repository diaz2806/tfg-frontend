import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component, OnInit } from '@angular/core';
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
export class Login implements OnInit {
  modoLogin = true;
  nombre = '';
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const usuario = localStorage.getItem('usuario');
      if (usuario) {
        console.log('👤 Usuario ya autenticado, redirigiendo...');
        this.router.navigate(['/dashboard']);
      }
    }
  }

  // 🔑 INICIAR SESIÓN
  login() {
    // ✅ Validar campos vacíos
    if (!this.email || !this.password) {
      this.errorMessage = '❌ Por favor completa todos los campos';
      return;
    }

    // ✅ Validar formato de email
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = '❌ Por favor introduce un email válido';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del backend:', response);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));

        this.email = '';
        this.password = '';

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('❌ Error en login:', err);
        this.errorMessage = 'Email o contraseña incorrectos';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  // 🧍 REGISTRAR NUEVO USUARIO
  register() {
    // ✅ Validar que todos los campos estén completos
    if (!this.nombre || !this.email || !this.password) {
      this.errorMessage = '❌ Por favor completa todos los campos';
      return;
    }

    // ✅ Validar que el nombre tenga al menos 2 caracteres
    if (this.nombre.trim().length < 2) {
      this.errorMessage = '❌ El nombre debe tener al menos 2 caracteres';
      return;
    }

    // ✅ Validar formato de email
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = '❌ Por favor introduce un email válido (ejemplo: usuario@dominio.com)';
      return;
    }

    // ✅ Validar longitud mínima de contraseña
    if (this.password.length < 6) {
      this.errorMessage = '❌ La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.nombre, this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Registro correcto:', response);
        this.errorMessage = '✅ Usuario registrado correctamente. Ahora puedes iniciar sesión.';
        this.modoLogin = true;

        this.nombre = '';
        this.email = '';
        this.password = '';
      },
      error: (err) => {
        console.error('❌ Error en registro:', err);
        // Mostrar el error específico del backend si existe
        this.errorMessage = err.error?.error || '❌ Error al registrar el usuario.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  // ✅ Función para validar email con regex estricto
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
