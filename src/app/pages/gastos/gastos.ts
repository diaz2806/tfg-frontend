import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCard } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MatGridListModule } from '@angular/material/grid-list';
import { GastosService } from '../../services/gastos.service';
import { Gasto } from '../../models/gasto.model';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { EditarGastoDialogComponent } from '../editar-gasto-dialog/editar-gasto-dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatCard,
    NgChartsModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './gastos.html',
  styleUrls: ['./gastos.css'],
})
export class Bills {
  isBrowser = false;
  dataSource = new MatTableDataSource<Gasto>([]);

  constructor(private gastosService: GastosService, private dialog: MatDialog) {
    if (typeof window !== 'undefined') {
      this.isBrowser = true;
    }
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.gastosService.getGastos().subscribe((data) => {
      this.gastos = data;
      this.gastosDiarios = this.agruparPorDia();
      this.gastosSemanales = this.agruparPorSemana();
      this.gastosMensuales = this.agruparPorMes();
      this.gastosAnuales = this.agruparPorAnio();
    });
  }

  nuevoGasto: Gasto = {
    nombre: '',
    descripcion: '',
    categoria: '',
    cantidad: 0,
    fecha: new Date().toISOString().substring(0, 10),
    recurrente: false,
  };

  gastos: Gasto[] = [];
  gastosDiarios: any;
  gastosSemanales: any;
  gastosMensuales: any;
  gastosAnuales: any;

  categorias = ['Alimentación', 'Transporte', 'Ocio', 'Suscripciones', 'Otros'];

  displayedColumns: string[] = [
    'nombre',
    'descripcion',
    'categoria',
    'cantidad',
    'fecha',
    'recurrente',
    'acciones',
  ];

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          color: '#444',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed + ' €';
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#666',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#666',
          callback: function (value) {
            return value + ' €';
          },
        },
      },
    },
  };

  cargarDatos() {
    this.gastosService.getGastos().subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  agregarGasto() {
    if (this.nuevoGasto.nombre && this.nuevoGasto.categoria && this.nuevoGasto.cantidad > 0) {
      this.gastosService.addGasto(this.nuevoGasto).subscribe(() => {
        this.cargarDatos();
        this.reiniciarGasto();
      });
    }
  }

  private agruparPorDia(): any {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const totales = new Array(7).fill(0);

    this.gastos.forEach((g) => {
      const fecha = new Date(g.fecha);
      const diaSemana = fecha.getDay(); // 0=Domingo, 1=Lunes...
      const index = diaSemana === 0 ? 6 : diaSemana - 1; // mover domingo al final
      totales[index] += g.cantidad;
    });

    return {
      labels: dias,
      datasets: [
        {
          label: 'Gastos diarios (€)',
          data: totales,
          backgroundColor: '#42A5F5',
          borderRadius: 6,
        },
      ],
    };
  }

  private agruparPorSemana(): any {
    const semanas = [0, 0, 0, 0];
    this.gastos.forEach((g) => {
      const fecha = new Date(g.fecha);
      const semana = Math.floor((fecha.getDate() - 1) / 7); // semana del mes
      semanas[semana] += g.cantidad;
    });

    return {
      labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
      datasets: [
        {
          label: 'Gastos semanales (€)',
          data: semanas,
          backgroundColor: ['#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9'],
        },
      ],
    };
  }

  private agruparPorMes(): any {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const totales = new Array(12).fill(0);

    this.gastos.forEach((g) => {
      const fecha = new Date(g.fecha);
      totales[fecha.getMonth()] += g.cantidad;
    });

    return {
      labels: meses,
      datasets: [
        {
          label: 'Gastos mensuales (€)',
          data: totales,
          backgroundColor: [
            '#FFB74D',
            '#FFA726',
            '#FB8C00',
            '#EF6C00',
            '#BA68C8',
            '#AB47BC',
            '#8E24AA',
            '#7B1FA2',
            '#4FC3F7',
            '#29B6F6',
            '#039BE5',
            '#0288D1',
          ],
        },
      ],
    };
  }

  private agruparPorAnio(): any {
    const totales: { [anio: string]: number } = {};

    this.gastos.forEach((g) => {
      const fecha = new Date(g.fecha);
      const anio = fecha.getFullYear();
      if (!totales[anio]) totales[anio] = 0;
      totales[anio] += g.cantidad;
    });

    const labels = Object.keys(totales).sort();
    const data = labels.map((anio) => totales[anio]);

    return {
      labels,
      datasets: [
        {
          label: 'Gastos anuales (€)',
          data,
          fill: false,
          borderColor: '#E91E63',
          backgroundColor: '#F06292',
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#E91E63',
        },
      ],
    };
  }

  actualizarGraficas() {
    this.gastosDiarios = this.agruparPorDia();
    this.gastosSemanales = this.agruparPorSemana();
    this.gastosMensuales = this.agruparPorMes();
    this.gastosAnuales = this.agruparPorAnio();
  }

  reiniciarGasto() {
    this.nuevoGasto = {
      nombre: '',
      descripcion: '',
      categoria: '',
      cantidad: 0,
      fecha: new Date().toISOString().substring(0, 10),
      recurrente: false,
      frecuencia: undefined,
    };
  }

  eliminarGasto(id: number) {
    if (confirm('¿Seguro que quieres eliminar este gasto?')) {
      this.gastosService.deleteGasto(id).subscribe(() => {
        this.cargarDatos();
      });
    }
  }

  editarGasto(gasto: any): void {
    const dialogRef = this.dialog.open(EditarGastoDialogComponent, {
      width: '400px',
      data: { ...gasto },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.gastosService.updateGasto(result.id, result).subscribe(() => {
          this.cargarDatos();
        });
      }
    });
  }
}
