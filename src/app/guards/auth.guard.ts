import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // Evita errores si se ejecuta en SSR
    if (typeof window === 'undefined') {
      console.warn('AuthGuard ejecutado fuera del navegador');
      return false;
    }

    const user = localStorage.getItem('user');
    console.log('Usuario guardado en localStorage:', user);

    if (user) {
      return true;
    } else {
      console.warn('No hay usuario autenticado, redirigiendo a login...');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
