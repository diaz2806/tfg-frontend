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
  private idUsuario = 1;

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
      console.log('📥 Eventos recibidos del backend:', eventos);

      const formattedEvents: EventInput[] = eventos.map((e) => {
        const fechaInicio = new Date(e.fechaInicio);
        const fechaFin = e.fechaFin ? new Date(e.fechaFin) : null;

        // ✅ Detectar si es evento de todo el día (hora 00:00 o sin hora específica)
        const esAllDay = fechaInicio.getHours() === 0 && fechaInicio.getMinutes() === 0;

        return {
          id: e.id?.toString(),
          title: e.titulo,
          start: e.fechaInicio,
          end: e.fechaFin,
          allDay: esAllDay, // ✅ Marcar como evento de todo el día
          backgroundColor: e.categoria?.color || '#2196f3',
          borderColor: e.categoria?.color || '#2196f3',
          extendedProps: {
            descripcion: e.descripcion,
            categoria: e.categoria,
            conGasto: e.conGasto,
            cantidad: e.cantidad,
          },
        };
      });

      console.log('🗓️ Eventos formateados:', formattedEvents);

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
      data: {
        start: arg.dateStr,
        allDay: arg.allDay, // ✅ Indicar si es un clic en día completo
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const idUsuario = usuario?.id || 0;

      // ✅ Si es evento de todo el día, no ajustar las horas
      let start = result.start;
      let end = result.end || result.start;

      const nuevo: Evento = {
        titulo: result.title?.trim() || 'Sin título',
        descripcion: result.descripcion || '',
        fechaInicio: start,
        fechaFin: end,
        conGasto: result.conGasto === true,
        cantidad: Number(result.cantidad) || 0,
        categoria: { id: result.categoriaId || 1 },
        usuario: { id: idUsuario },
      };

      console.log('🟢 Creando evento (normalizado):', nuevo);

      this.eventosService.crearEvento(nuevo, idUsuario).subscribe({
        next: (res) => {
          console.log('✅ Evento creado:', res);
          this.ngOnInit();
        },
        error: (err) => console.error('❌ Error al crear evento:', err),
      });
    });
  }

  handleEventClick(arg: EventClickArg) {
    const dialogRef = this.dialog.open(AnadirEventoDialogComponent, {
      width: '700px',
      data: {
        id: arg.event.id,
        title: arg.event.title,
        start: arg.event.start?.toISOString(),
        end: arg.event.end?.toISOString(),
        descripcion: arg.event.extendedProps['descripcion'],
        categoria: arg.event.extendedProps['categoria'],
        conGasto: arg.event.extendedProps['conGasto'] || false,
        cantidad: arg.event.extendedProps['cantidad'] || 0,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const idUsuario = usuario?.id || 0;

      if (result.eliminar) {
        // 🗑️ Eliminar evento
        console.log('🗑️ Eliminando evento con ID:', result.id);
        this.eventosService.eliminarEvento(result.id).subscribe({
          next: () => {
            console.log('✅ Evento eliminado correctamente');
            // ✅ ELIMINAR EL EVENTO DEL CALENDARIO INMEDIATAMENTE
            arg.event.remove();
            // ✅ RECARGAR TAMBIÉN PARA ASEGURAR
            this.ngOnInit();
          },
          error: (err) => {
            console.error('❌ Error al eliminar evento:', err);
            alert('Error al eliminar el evento');
          },
        });
      } else if (result.id) {
        // ✏️ Actualizar evento
        const eventoActualizado = {
          id: result.id,
          titulo: result.title,
          descripcion: result.descripcion,
          fechaInicio: result.start,
          fechaFin: result.end,
          conGasto: result.conGasto,
          cantidad: result.cantidad,
          categoria: { id: result.categoriaId },
          usuario: { id: idUsuario },
        };

        this.eventosService.actualizarEvento(eventoActualizado).subscribe({
          next: () => {
            console.log('✏️ Evento actualizado');
            this.ngOnInit();
          },
          error: (err) => console.error('❌ Error al actualizar evento:', err),
        });
      } else {
        // 🟢 Crear nuevo evento
        const nuevoEvento = {
          titulo: result.title,
          descripcion: result.descripcion,
          fechaInicio: result.start,
          fechaFin: result.end,
          conGasto: result.conGasto,
          cantidad: result.cantidad,
          categoria: { id: result.categoriaId },
          usuario: { id: idUsuario },
        };

        this.eventosService.crearEvento(nuevoEvento, idUsuario).subscribe({
          next: () => {
            console.log('🟢 Evento creado correctamente');
            this.ngOnInit();
          },
          error: (err) => console.error('❌ Error al crear evento:', err),
        });
      }
    });
  }
}
