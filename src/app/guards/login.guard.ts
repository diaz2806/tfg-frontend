import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const usuario = localStorage.getItem('usuario');

    if (usuario) {
      // Si ya está logueado, redirige al dashboard
      console.log('👤 Usuario ya autenticado, redirigiendo a dashboard');
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      // Si no está logueado, permite acceder al login
      return true;
    }
  }
}
