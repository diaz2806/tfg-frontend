// src/app/services/ia.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IaService {

  private apiUrl = 'http://localhost:8081/api/ia';

  constructor(private http: HttpClient) { }

  // 1. ANÁLISIS CLÁSICO (ya funcionaba perfecto)
  analizarGastos(idUsuario: number, sueldo?: number): Observable<any> {
    const body: any = { idUsuario };
    if (sueldo !== undefined && sueldo !== null) {
      body.sueldo = sueldo;
    }
    return this.http.post(`${this.apiUrl}/analizar`, body);
  }

  // 2. PREDICCIÓN PRÓXIMO MES → AHORA SÍ FUNCIONA
  predecirProximoMes(idUsuario: number, sueldo?: number): Observable<any> {
    const body: any = { idUsuario };
    if (sueldo !== undefined && sueldo !== null) {
      body.sueldo = sueldo;
    }
    return this.http.post(`${this.apiUrl}/prediccion`, body);
  }

  // 3. SUGERIR EVENTOS → AHORA SÍ FUNCIONA
  sugerirEventosCalendario(idUsuario: number): Observable<any> {
    const body = { idUsuario };
    return this.http.post(`${this.apiUrl}/sugerir-eventos`, body);
  }

  preguntarConsejero(idUsuario: number, pregunta: string, sueldo?: number): Observable<any> {
  const body: any = { idUsuario, pregunta };
  if (sueldo) body.sueldo = sueldo;
  return this.http.post(`${this.apiUrl}/consejero`, body);
}
}
