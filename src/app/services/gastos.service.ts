import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gasto } from '../models/gasto.model';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class GastosService {
  private apiUrl = `${environment.apiUrl}/gastos`;

  constructor(private http: HttpClient) {}

  getGastos(): Observable<Gasto[]> {
    // ✅ CAMBIAR PARA FILTRAR POR USUARIO
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const idUsuario = usuario?.id || 1;
    return this.http.get<Gasto[]>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  addGasto(gasto: Gasto): Observable<Gasto> {
    return this.http.post<Gasto>(this.apiUrl, gasto);
  }

  deleteGasto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateGasto(id: number, gasto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, gasto);
  }

  getCategorias(): Observable<string[]> {
    return this.http.get<string[]>("http://localhost:8081/api/categorias");
  }
}
