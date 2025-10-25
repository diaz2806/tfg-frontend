import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { AnadirEventoDialogComponent } from '../anadir-evento-dialog/anadir-evento-dialog';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, MatCard],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css'],
})
export class Calendario implements OnInit {
  calendarOptions?: CalendarOptions;
  private isBrowser = false;

  constructor(
    private dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    // Si no estamos en navegador (SSR), salimos.
    if (!this.isBrowser) return;

    // cargamos plugins dinámicamente (evita errores en entorno servidor)
    const [
      dayGridModule,
      timeGridModule,
      interactionModule,
      listModule
    ] = await Promise.all([
      import('@fullcalendar/daygrid'),
      import('@fullcalendar/timegrid'),
      import('@fullcalendar/interaction'),
      import('@fullcalendar/list')
    ]);

    const dayGridPlugin = dayGridModule.default;
    const timeGridPlugin = timeGridModule.default;
    const interactionPlugin = interactionModule.default;
    const listPlugin = listModule.default;

    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      initialView: 'dayGridMonth',
      height: '100%',
      expandRows: true,
      nowIndicator: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      buttonText: {
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        list: 'Lista'
      },
      selectable: true,
      editable: true,
      dateClick: this.handleDateClick.bind(this),
      eventClick: this.handleEventClick.bind(this),
      events: []
    };
  }

  handleDateClick(arg: DateClickArg) {
    const dialogRef = this.dialog.open(AnadirEventoDialogComponent, {
      width: '400px',
      data: { start: arg.dateStr }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.calendarOptions?.events) {
        this.calendarOptions = {
          ...this.calendarOptions,
          events: [...(this.calendarOptions.events as any[]), result]
        };
      }
    });
  }

  handleEventClick(arg: EventClickArg) {
    const dialogRef = this.dialog.open(AnadirEventoDialogComponent, {
      width: '400px',
      data: {
        title: arg.event.title,
        start: arg.event.start?.toISOString().slice(0,16),
        end: arg.event.end?.toISOString().slice(0,16)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        arg.event.setProp('title', result.title);
        arg.event.setStart(result.start);
        arg.event.setEnd(result.end);
      }
    });
  }
}
