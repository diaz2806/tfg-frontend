import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento } from '../models/evento.model';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = 'http://localhost:8081/api/eventos';

  constructor(private http: HttpClient) {}

  obtenerEventos(): Observable<any[]> {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const idUsuario = usuario?.id;
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  crearEvento(evento: Evento, idUsuario: number): Observable<Evento> {
  return this.http.post<Evento>(`http://localhost:8081/api/eventos/usuario/${idUsuario}`, evento);
}


  actualizarEvento(evento: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${evento.id}`, evento);
  }

  eliminarEvento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
