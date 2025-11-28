import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8081/api';
  private authUrl = 'http://localhost:8081/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.authUrl}/login`, { email, contrasena: password });
  }

  register(nombre: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, {
      nombre,
      email,
      contrasena: password,
    });
  }

  // AHORA SÍ FUNCIONA
  actualizarSueldo(sueldo: number): Observable<any> {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const id = usuario?.id;

    if (!id) {
      alert('Error: No estás logueado');
      return throwError(() => new Error('No logueado'));
    }

    // RUTA CORRECTA → /api/usuarios/...
    return this.http.put(`${this.apiUrl}/usuarios/${id}/sueldo`, { sueldo });
  }
}
