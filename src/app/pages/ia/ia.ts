import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IaService } from '../../services/ia.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar'; // ← AÑADIDO

@Component({
  selector: 'app-ia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTab,
    MatTabGroup,
    DatePipe,
  ],
  templateUrl: './ia.html',
  styleUrls: ['./ia.css'],
})
export class Ia implements OnInit {
  sueldo: number = 0;
  analizando = false;
  analisisRealizado = false;
  resultadoAnalisis = '';
  totalMesActual = 0;
  totalMesAnterior = 0;
  cargandoPrediccion = false;
  prediccion = '';
  cargandoEventos = false;
  eventos: any[] = [];
  preguntaConsejero = '';
  respuestaConsejero = '';

  constructor(
    private iaService: IaService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private snackBar: MatSnackBar // ← INYECTADO CORRECTAMENTE
  ) {}

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.sueldo = usuario?.sueldo > 0 ? usuario.sueldo : 0;
  }

  // === TOAST PROFESIONAL ===
  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.snackBar.open(mensaje, '✖', {
      duration: tipo === 'success' ? 3000 : 5000,
      panelClass: tipo === 'success' ? 'snack-success' : 'snack-error',
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  // === GUARDAR SUELDO (con toast bonito) ===
  guardarSueldo() {
    if (!this.sueldo || this.sueldo <= 0) {
      this.mostrarMensaje('Introduce un sueldo válido', 'error');
      return;
    }

    this.authService.actualizarSueldo(this.sueldo).subscribe({
      next: (usuarioActualizado: any) => {
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        this.mostrarMensaje('Sueldo guardado correctamente');
      },
      error: (err) => {
        console.error('Error al guardar sueldo:', err);
        this.mostrarMensaje('Error al guardar el sueldo', 'error');
      }
    });
  }

  // === RESTO DE MÉTODOS (mejoro algunos alerts también) ===
  analizarGastos() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const idUsuario = usuario?.id;

    if (!idUsuario) {
      this.mostrarMensaje('Error: Usuario no encontrado', 'error');
      return;
    }

    this.analizando = true;
    this.analisisRealizado = false;

    this.iaService.analizarGastos(idUsuario, this.sueldo || undefined).subscribe({
      next: (resultado) => {
        this.resultadoAnalisis = resultado.analisis;
        this.totalMesActual = parseFloat(resultado.totalMesActual) || 0;
        this.totalMesAnterior = parseFloat(resultado.totalMesAnterior) || 0;
        this.analizando = false;
        this.analisisRealizado = true;
      },
      error: () => {
        this.resultadoAnalisis = 'Error temporal con la IA. Inténtalo más tarde.';
        this.analizando = false;
        this.analisisRealizado = true;
      }
    });
  }

  hacerPrediccion() {
    const idUsuario = this.getIdUsuario();
    if (!idUsuario) return;

    this.cargandoPrediccion = true;
    this.iaService.predecirProximoMes(idUsuario, this.sueldo || undefined).subscribe({
      next: (res) => {
        this.prediccion = res.prediccion;
        this.cargandoPrediccion = false;
      },
      error: () => {
        this.prediccion = 'Error al predecir. Inténtalo más tarde.';
        this.cargandoPrediccion = false;
      }
    });
  }

  sugerirEventos() {
    const idUsuario = this.getIdUsuario();
    if (!idUsuario) return;

    this.cargandoEventos = true;
    this.iaService.sugerirEventosCalendario(idUsuario).subscribe({
      next: (res) => {
        this.eventos = res.eventos || [];
        this.cargandoEventos = false;
      },
      error: () => {
        this.eventos = [];
        this.cargandoEventos = false;
        this.mostrarMensaje('Error al generar eventos', 'error');
      }
    });
  }

  agregarEventoACalendario(evento: any) {
    this.mostrarMensaje(`Evento añadido: ${evento.titulo}`, 'success');
  }

  private getIdUsuario(): number | null {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (!usuario?.id) {
      this.mostrarMensaje('Sesión no encontrada', 'error');
      return null;
    }
    return usuario.id;
  }

  preguntarAlConsejero() {
    const id = this.getIdUsuario();
    if (!id || !this.preguntaConsejero.trim()) return;

    this.iaService
      .preguntarConsejero(id, this.preguntaConsejero, this.sueldo || undefined)
      .subscribe((res) => {
        this.respuestaConsejero = res.respuesta;
        this.preguntaConsejero = '';
      });
  }

  safeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content.replace(/\n/g, '<br>'));
  }
}
