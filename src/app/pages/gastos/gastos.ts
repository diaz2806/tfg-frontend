import { Component, OnInit } from '@angular/core';
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
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/categoria.model';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

type PeriodoFiltro = 'diario' | 'semanal' | 'mensual' | 'anual';

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
    MatButtonToggleModule,
  ],
  templateUrl: './gastos.html',
  styleUrls: ['./gastos.css'],
})
export class Bills implements OnInit {
  isBrowser = false;
  dataSource = new MatTableDataSource<Gasto>([]);

  nuevoGasto: Gasto = {
    nombre: '',
    descripcion: '',
    categoria: '',
    cantidad: 0,
    fecha: new Date().toISOString().substring(0, 10),
    recurrente: false,
  };

  gastos: Gasto[] = [];
  categorias: Categoria[] = [];

  // ✅ FILTROS DE LA GRÁFICA
  periodoSeleccionado: PeriodoFiltro = 'mensual';
  categoriaSeleccionada: string = 'todas';

  // ✅ DATOS DE LA GRÁFICA
  chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [],
  };

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
    maintainAspectRatio: false,
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
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) label += context.parsed.y.toFixed(2) + ' €';
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#666' },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#666',
          callback: (value) => value + ' €',
        },
      },
    },
  };

  constructor(
    private gastosService: GastosService,
    private dialog: MatDialog,
    private categoriaService: CategoriaService
  ) {
    if (typeof window !== 'undefined') this.isBrowser = true;
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarDatos();
  }

  cargarCategorias() {
    this.categoriaService.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      },
    });
  }

  cargarDatos() {
    this.gastosService.getGastos().subscribe((data) => {
      this.gastos = data;
      this.dataSource.data = data;
      this.actualizarGrafica();
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

  reiniciarGasto() {
    this.nuevoGasto = {
      nombre: '',
      descripcion: '',
      categoria: '',
      cantidad: 0,
      fecha: new Date().toISOString().substring(0, 10),
      recurrente: false,
    };
  }

  eliminarGasto(id: number) {
    if (confirm('¿Seguro que quieres eliminar este gasto?')) {
      this.gastosService.deleteGasto(id).subscribe(() => this.cargarDatos());
    }
  }

  editarGasto(gasto: any): void {
    const dialogRef = this.dialog.open(EditarGastoDialogComponent, {
      width: '400px',
      data: { ...gasto },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.gastosService.updateGasto(result.id, result).subscribe(() => this.cargarDatos());
      }
    });
  }

  // ✅ ACTUALIZAR FILTROS Y REGENERAR GRÁFICA
  cambiarPeriodo(periodo: PeriodoFiltro) {
    this.periodoSeleccionado = periodo;
    this.actualizarGrafica();
  }

  cambiarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.actualizarGrafica();
  }

  // ✅ EXPANDIR GASTOS RECURRENTES (nuevo método auxiliar)
  private expandirGastosRecurrentes(gastos: Gasto[]): Gasto[] {
    const gastosExpandidos: Gasto[] = [];

    gastos.forEach((gasto) => {
      if (gasto.recurrente && gasto.frecuencia) {
        // Expandir gastos recurrentes
        const fechaOriginal = new Date(gasto.fecha);
        const hoy = new Date();

        // Generar instancias desde la fecha original hasta hoy
        let fechaActual = new Date(fechaOriginal);

        while (fechaActual <= hoy) {
          gastosExpandidos.push({
            ...gasto,
            fecha: fechaActual.toISOString().split('T')[0],
          });

          // Incrementar según frecuencia
          switch (gasto.frecuencia) {
            case 'semanal':
              fechaActual.setDate(fechaActual.getDate() + 7);
              break;
            case 'mensual':
              fechaActual.setMonth(fechaActual.getMonth() + 1);
              break;
            case 'anual':
              fechaActual.setFullYear(fechaActual.getFullYear() + 1);
              break;
          }
        }
      } else {
        // Gasto no recurrente, añadir tal cual
        gastosExpandidos.push(gasto);
      }
    });

    return gastosExpandidos;
  }

  // ✅ ACTUALIZAR GRÁFICA (modificar método existente)
  actualizarGrafica() {
    // Filtrar gastos por categoría
    let gastosFiltrados = this.gastos;
    if (this.categoriaSeleccionada !== 'todas') {
      gastosFiltrados = this.gastos.filter((g) => g.categoria === this.categoriaSeleccionada);
    }

    // ✅ EXPANDIR GASTOS RECURRENTES ANTES DE GENERAR LA GRÁFICA
    const gastosExpandidos = this.expandirGastosRecurrentes(gastosFiltrados);

    // Generar datos según el periodo
    switch (this.periodoSeleccionado) {
      case 'diario':
        this.chartData = this.generarGraficaDiaria(gastosExpandidos);
        break;
      case 'semanal':
        this.chartData = this.generarGraficaSemanal(gastosExpandidos);
        break;
      case 'mensual':
        this.chartData = this.generarGraficaMensual(gastosExpandidos);
        break;
      case 'anual':
        this.chartData = this.generarGraficaAnual(gastosExpandidos);
        break;
    }
  }

  // ✅ GRÁFICA DIARIA - Últimos 7 días (sin cambios, ya usa los gastosExpandidos)
  private generarGraficaDiaria(gastos: Gasto[]): ChartConfiguration['data'] {
    const hoy = new Date();
    const labels: string[] = [];
    const datos: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      labels.push(this.formatearFecha(fecha, 'diario'));

      const totalDia = gastos
        .filter((g) => g.fecha === fechaStr)
        .reduce((sum, g) => sum + (g.cantidad || 0), 0);
      datos.push(totalDia);
    }

    return this.crearDatasetPorCategoria(labels, datos, gastos);
  }

  // ✅ GRÁFICA SEMANAL - Últimas 4 semanas (sin cambios)
  private generarGraficaSemanal(gastos: Gasto[]): ChartConfiguration['data'] {
    const labels: string[] = [];
    const datos: number[] = [];
    const hoy = new Date();

    for (let i = 3; i >= 0; i--) {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - i * 7 - hoy.getDay());
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);

      labels.push(`Sem ${this.getNumeroSemana(inicioSemana)}`);

      const totalSemana = gastos
        .filter((g) => {
          const fecha = new Date(g.fecha);
          return fecha >= inicioSemana && fecha <= finSemana;
        })
        .reduce((sum, g) => sum + (g.cantidad || 0), 0);
      datos.push(totalSemana);
    }

    return this.crearDatasetPorCategoria(labels, datos, gastos);
  }

  // ✅ GRÁFICA MENSUAL - Últimos 6 meses (sin cambios)
  private generarGraficaMensual(gastos: Gasto[]): ChartConfiguration['data'] {
    const labels: string[] = [];
    const datos: number[] = [];
    const hoy = new Date();

    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      labels.push(this.formatearFecha(mes, 'mensual'));

      const totalMes = gastos
        .filter((g) => {
          const fecha = new Date(g.fecha);
          return fecha.getMonth() === mes.getMonth() && fecha.getFullYear() === mes.getFullYear();
        })
        .reduce((sum, g) => sum + (g.cantidad || 0), 0);
      datos.push(totalMes);
    }

    return this.crearDatasetPorCategoria(labels, datos, gastos);
  }

  // ✅ GRÁFICA ANUAL - Últimos 3 años (sin cambios)
  private generarGraficaAnual(gastos: Gasto[]): ChartConfiguration['data'] {
    const labels: string[] = [];
    const datos: number[] = [];
    const añoActual = new Date().getFullYear();

    for (let i = 2; i >= 0; i--) {
      const año = añoActual - i;
      labels.push(año.toString());

      const totalAño = gastos
        .filter((g) => new Date(g.fecha).getFullYear() === año)
        .reduce((sum, g) => sum + (g.cantidad || 0), 0);
      datos.push(totalAño);
    }

    return this.crearDatasetPorCategoria(labels, datos, gastos);
  }

  // ✅ CREAR DATASET (actualizado para manejar gastos expandidos)
  private crearDatasetPorCategoria(
    labels: string[],
    datos: number[],
    gastos: Gasto[]
  ): ChartConfiguration['data'] {
    if (this.categoriaSeleccionada !== 'todas') {
      // Una sola categoría - usar su color
      const categoria = this.categorias.find((c) => c.nombre === this.categoriaSeleccionada);
      const color = categoria?.color || '#2196f3';

      return {
        labels,
        datasets: [
          {
            label: this.categoriaSeleccionada,
            data: datos,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 2,
          },
        ],
      };
    } else {
      // Todas las categorías - agrupar por categoría
      const datasets = this.categorias.map((cat) => {
        const datosCategoria = labels.map((label, idx) => {
          return this.calcularTotalCategoriaPorPeriodo(gastos, cat.nombre, idx);
        });

        return {
          label: cat.nombre,
          data: datosCategoria,
          backgroundColor: cat.color || '#2196f3',
          borderColor: cat.color || '#2196f3',
          borderWidth: 2,
        };
      });

      return { labels, datasets };
    }
  }

  private calcularTotalCategoriaPorPeriodo(
    gastos: Gasto[],
    categoria: string,
    indicePeriodo: number
  ): number {
    const hoy = new Date();
    let fechaInicio: Date;
    let fechaFin: Date;

    switch (this.periodoSeleccionado) {
      case 'diario':
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - (6 - indicePeriodo));
        fechaFin = new Date(fechaInicio);
        fechaFin.setHours(23, 59, 59, 999);
        break;
      case 'semanal':
        fechaInicio = new Date(hoy);
        fechaInicio.setDate(hoy.getDate() - (3 - indicePeriodo) * 7 - hoy.getDay());
        fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaInicio.getDate() + 6);
        break;
      case 'mensual':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - indicePeriodo), 1);
        fechaFin = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth() + 1, 0);
        break;
      case 'anual':
        const año = hoy.getFullYear() - (2 - indicePeriodo);
        fechaInicio = new Date(año, 0, 1);
        fechaFin = new Date(año, 11, 31);
        break;
      default:
        return 0;
    }

    return gastos
      .filter((g) => {
        const fecha = new Date(g.fecha);
        return g.categoria === categoria && fecha >= fechaInicio && fecha <= fechaFin;
      })
      .reduce((sum, g) => sum + (g.cantidad || 0), 0);
  }

  // ✅ UTILIDADES DE FORMATO (sin cambios)
  private formatearFecha(fecha: Date, tipo: PeriodoFiltro): string {
    if (tipo === 'diario') {
      return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    } else if (tipo === 'mensual') {
      return fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    }
    return fecha.toLocaleDateString('es-ES');
  }

  private getNumeroSemana(fecha: Date): number {
    const inicio = new Date(fecha.getFullYear(), 0, 1);
    const diff = fecha.getTime() - inicio.getTime();
    const unDia = 1000 * 60 * 60 * 24;
    return Math.ceil(diff / unDia / 7);
  }
}
