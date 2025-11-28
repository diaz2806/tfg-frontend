import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { AnadirEventoDialogComponent } from '../anadir-evento-dialog/anadir-evento-dialog';
import { EventoService } from '../../services/evento.service';
import { Evento } from '../../models/evento.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, MatCardModule],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css'],
})
export class Calendario implements OnInit {
  calendarOptions?: CalendarOptions;
  private isBrowser = false;

  constructor(
    private dialog: MatDialog,
    private eventosService: EventoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    if (!this.isBrowser) return;

    const [dayGridModule, timeGridModule, interactionModule, listModule] = await Promise.all([
      import('@fullcalendar/daygrid'),
      import('@fullcalendar/timegrid'),
      import('@fullcalendar/interaction'),
      import('@fullcalendar/list'),
    ]);

    this.cargarEventos(dayGridModule, timeGridModule, interactionModule, listModule);
  }

  cargarEventos(dayGridModule: any, timeGridModule: any, interactionModule: any, listModule: any) {
    this.eventosService.obtenerEventos().subscribe((eventos) => {
      console.log('Eventos recibidos del backend:', eventos);

      const formattedEvents: EventInput[] = eventos.map((e: any) => {
        const fechaInicio = new Date(e.fechaInicio);
        const fechaFin = e.fechaFin ? new Date(e.fechaFin) : null;
        const esAllDay = fechaInicio.getHours() === 0 && fechaInicio.getMinutes() === 0;

        // Construir objeto categoría completo para FullCalendar
        const categoriaCompleta = e.categoria
          ? { id: e.categoria.id, nombre: e.categoria.nombre, color: e.categoria.color }
          : { id: 10, nombre: 'Otros', color: '#95a5a6' };

        return {
          id: e.id?.toString(),
          title: e.titulo || 'Sin título',
          start: e.fechaInicio,
          end: e.fechaFin || undefined,
          allDay: esAllDay,
          backgroundColor: categoriaCompleta.color,
          borderColor: categoriaCompleta.color,
          extendedProps: {
            descripcion: e.descripcion || '',
            categoria: categoriaCompleta,
            conGasto: e.conGasto || false,
            cantidad: e.cantidad || 0,
          },
        };
      });

      this.calendarOptions = {
        plugins: [
          dayGridModule.default,
          timeGridModule.default,
          interactionModule.default,
          listModule.default,
        ],
        initialView: 'dayGridMonth',
        height: '100%',
        nowIndicator: true,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
        },
        selectable: true,
        editable: true,
        events: formattedEvents,
        dateClick: this.handleDateClick.bind(this),
        eventClick: this.handleEventClick.bind(this),
      };
    });
  }

  handleDateClick(arg: DateClickArg) {
    const dialogRef = this.dialog.open(AnadirEventoDialogComponent, {
      width: '700px',
      data: { start: arg.dateStr, allDay: arg.allDay },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const idUsuario = usuario?.id || 1;

      const nuevoEvento: Evento = {
        titulo: result.title?.trim() || 'Evento sin título',
        descripcion: result.descripcion || '',
        fechaInicio: result.start,
        fechaFin: result.end || result.start,
        conGasto: result.conGasto === true,
        cantidad: Number(result.cantidad) || 0,
        categoria: { id: Number(result.categoriaId) || 10 }, // Solo el ID
        usuario: { id: idUsuario },
        frecuencia: '',
        esRecurrente: false
      };

      this.eventosService.crearEvento(nuevoEvento, idUsuario).subscribe({
        next: () => this.ngOnInit(),
        error: (err) => console.error('Error al crear evento:', err),
      });
    });
  }

  handleEventClick(arg: EventClickArg) {
    const props = arg.event.extendedProps as any;

    const dialogRef = this.dialog.open(AnadirEventoDialogComponent, {
      width: '700px',
      data: {
        id: arg.event.id,
        title: arg.event.title,
        start: arg.event.start?.toISOString(),
        end: arg.event.end?.toISOString() || null,
        descripcion: props.descripcion,
        categoria: props.categoria, // objeto completo con id, nombre, color
        conGasto: props.conGasto || false,
        cantidad: props.cantidad || 0,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const idUsuario = usuario?.id || 1;

      if (result.eliminar) {
        this.eventosService.eliminarEvento(Number(result.id)).subscribe({
          next: () => {
            arg.event.remove();
            this.ngOnInit();
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            alert('No se pudo eliminar el evento');
          },
        });
      } else if (result.id) {
        // ACTUALIZAR
        const eventoActualizado: Evento = {
          id: Number(result.id),
          titulo: result.title,
          descripcion: result.descripcion,
          fechaInicio: result.start,
          fechaFin: result.end,
          conGasto: result.conGasto,
          cantidad: Number(result.cantidad) || 0,
          categoria: { id: Number(result.categoriaId) || 10 },
          usuario: { id: idUsuario },
          frecuencia: '',
          esRecurrente: false
        };

        this.eventosService.actualizarEvento(eventoActualizado).subscribe({
          next: () => this.ngOnInit(),
          error: (err) => console.error('Error al actualizar:', err),
        });
      }
    });
  }
}
