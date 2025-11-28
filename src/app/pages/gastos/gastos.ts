import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { EditarGastoDialogComponent } from '../editar-gasto-dialog/editar-gasto-dialog';
import { GastosService } from '../../services/gastos.service';
import { Gasto } from '../../models/gasto.model';
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
    MatCheckboxModule,
    MatCardModule,
    NgChartsModule,
    MatIconModule,
    MatButtonToggleModule,
  ],
  templateUrl: './gastos.html',
  styleUrls: ['./gastos.css'],
})
export class Bills implements OnInit {
  isBrowser = false;
  dataSource = new MatTableDataSource<Gasto>([]);

  nombre: string = '';
  descripcion: string = '';
  cantidad: number = 0;
  fecha: string = new Date().toISOString().substring(0, 10);
  recurrente: boolean = false;
  frecuencia: 'mensual' | 'semanal' | 'anual' | null = null;
  categoriaSeleccionadaId: number = 1;

  gastos: Gasto[] = [];
  categorias: Categoria[] = [];

  periodoSeleccionado: PeriodoFiltro = 'mensual';

  chartData: ChartConfiguration['data'] = { labels: [], datasets: [] };

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
      legend: { position: 'top' },
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
      y: { beginAtZero: true, ticks: { callback: (value) => value + ' €' } },
    },
  };

  constructor(
    private gastosService: GastosService,
    private dialog: MatDialog,
    private categoriaService: CategoriaService
  ) {
    this.isBrowser = typeof window !== 'undefined';
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarDatos();
  }

  cargarCategorias() {
    this.categoriaService.obtenerCategorias().subscribe((data) => {
      this.categorias = data;
      if (data.length > 0) this.categoriaSeleccionadaId = data[0].id;
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
    if (!this.nombre.trim() || this.cantidad <= 0 || !this.categoriaSeleccionadaId) return;

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    const gasto: Gasto = {
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim() || '',
      cantidad: this.cantidad,
      fecha: this.fecha,
      recurrente: this.recurrente,
      frecuencia: this.recurrente ? this.frecuencia : null,
      usuario: { id: usuario.id },
      categoria: { id: this.categoriaSeleccionadaId },
    };

    this.gastosService.addGasto(gasto).subscribe({
      next: () => {
        this.cargarDatos();
        this.limpiarFormulario();
      },
    });
  }

  limpiarFormulario() {
    this.nombre = '';
    this.descripcion = '';
    this.cantidad = 0;
    this.fecha = new Date().toISOString().substring(0, 10);
    this.recurrente = false;
    this.frecuencia = null;
    this.categoriaSeleccionadaId = this.categorias[0]?.id || 1;
  }

  eliminarGasto(id: number) {
    if (confirm('¿Seguro que quieres eliminar este gasto?')) {
      this.gastosService.deleteGasto(id).subscribe(() => this.cargarDatos());
    }
  }

  editarGasto(gasto: Gasto) {
    const dialogRef = this.dialog.open(EditarGastoDialogComponent, {
      width: '400px',
      data: { ...gasto },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.gastosService.updateGasto(result.id!, result).subscribe(() => this.cargarDatos());
      }
    });
  }

  cambiarPeriodo(periodo: PeriodoFiltro) {
    this.periodoSeleccionado = periodo;
    this.actualizarGrafica();
  }

  private expandirGastosRecurrentes(gastos: Gasto[]): Gasto[] {
    const expandidos: Gasto[] = [];
    const hoy = new Date();

    gastos.forEach((gasto) => {
      if (gasto.recurrente && gasto.frecuencia) {
        let fechaActual = new Date(gasto.fecha);
        while (fechaActual <= hoy) {
          expandidos.push({ ...gasto, fecha: fechaActual.toISOString().split('T')[0] });
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
        expandidos.push(gasto);
      }
    });
    return expandidos;
  }

  actualizarGrafica() {
    let filtrados = this.gastos;
    if (this.categoriaSeleccionadaId > 0) {
      filtrados = this.gastos.filter((g) => g.categoria?.id === this.categoriaSeleccionadaId);
    }
    const expandidos = this.expandirGastosRecurrentes(filtrados);

    switch (this.periodoSeleccionado) {
      case 'diario':
        this.chartData = this.generarGraficaDiaria(expandidos);
        break;
      case 'semanal':
        this.chartData = this.generarGraficaSemanal(expandidos);
        break;
      case 'mensual':
        this.chartData = this.generarGraficaMensual(expandidos);
        break;
      case 'anual':
        this.chartData = this.generarGraficaAnual(expandidos);
        break;
    }
  }

  private generarGraficaDiaria(gastos: Gasto[]): ChartConfiguration['data'] {
    const hoy = new Date();
    const labels: string[] = [];
    const datos: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      labels.push(fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
      datos.push(
        gastos.filter((g) => g.fecha === fechaStr).reduce((s, g) => s + (g.cantidad || 0), 0)
      );
    }
    return this.crearDataset(labels, datos, gastos);
  }

  private generarGraficaSemanal(gastos: Gasto[]): ChartConfiguration['data'] {
    const hoy = new Date();
    const labels: string[] = [];
    const datos: number[] = [];

    for (let i = 3; i >= 0; i--) {
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - i * 7 - hoy.getDay() + 1);
      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      labels.push(`Sem ${this.getNumeroSemana(inicio)}`);
      datos.push(
        gastos
          .filter((g) => {
            const f = new Date(g.fecha);
            return f >= inicio && f <= fin;
          })
          .reduce((s, g) => s + (g.cantidad || 0), 0)
      );
    }
    return this.crearDataset(labels, datos, gastos);
  }

  private generarGraficaMensual(gastos: Gasto[]): ChartConfiguration['data'] {
    const hoy = new Date();
    const labels: string[] = [];
    const datos: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      labels.push(mes.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }));
      datos.push(
        gastos
          .filter((g) => {
            const f = new Date(g.fecha);
            return f.getMonth() === mes.getMonth() && f.getFullYear() === mes.getFullYear();
          })
          .reduce((s, g) => s + (g.cantidad || 0), 0)
      );
    }
    return this.crearDataset(labels, datos, gastos);
  }

  private generarGraficaAnual(gastos: Gasto[]): ChartConfiguration['data'] {
    const añoActual = new Date().getFullYear();
    const labels: string[] = [];
    const datos: number[] = [];

    for (let i = 2; i >= 0; i--) {
      const año = añoActual - i;
      labels.push(año.toString());
      datos.push(
        gastos
          .filter((g) => new Date(g.fecha).getFullYear() === año)
          .reduce((s, g) => s + (g.cantidad || 0), 0)
      );
    }
    return this.crearDataset(labels, datos, gastos);
  }

  private crearDataset(
    labels: string[],
    datos: number[],
    gastos: Gasto[]
  ): ChartConfiguration['data'] {
    if (this.categoriaSeleccionadaId > 0) {
      const cat = this.categorias.find((c) => c.id === this.categoriaSeleccionadaId);
      return {
        labels,
        datasets: [
          {
            label: cat?.nombre || 'Gastos',
            data: datos,
            backgroundColor: cat?.color || '#2196f3',
            borderColor: cat?.color || '#2196f3',
            borderWidth: 2,
          },
        ],
      };
    }

    const datasets = this.categorias.map((cat) => ({
      label: cat.nombre,
      data: labels.map((_, idx) => this.calcularTotalCategoriaPorPeriodo(gastos, cat.id, idx)),
      backgroundColor: cat.color || '#2196f3',
      borderColor: cat.color || '#2196f3',
      borderWidth: 2,
    }));

    return { labels, datasets };
  }

  private calcularTotalCategoriaPorPeriodo(
    gastos: Gasto[],
    categoriaId: number,
    indice: number
  ): number {
    const hoy = new Date();
    let inicio: Date, fin: Date;

    switch (this.periodoSeleccionado) {
      case 'diario':
        inicio = new Date(hoy);
        inicio.setDate(hoy.getDate() - (6 - indice));
        fin = new Date(inicio);
        fin.setHours(23, 59, 59, 999);
        break;
      case 'semanal':
        inicio = new Date(hoy);
        inicio.setDate(hoy.getDate() - (3 - indice) * 7 - hoy.getDay() + 1);
        fin = new Date(inicio);
        fin.setDate(inicio.getDate() + 6);
        break;
      case 'mensual':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - indice), 1);
        fin = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0);
        break;
      case 'anual':
        const año = hoy.getFullYear() - (2 - indice);
        inicio = new Date(año, 0, 1);
        fin = new Date(año, 11, 31);
        break;
      default:
        return 0;
    }

    return gastos
      .filter(
        (g) =>
          g.categoria?.id === categoriaId && new Date(g.fecha) >= inicio && new Date(g.fecha) <= fin
      )
      .reduce((sum, g) => sum + (g.cantidad || 0), 0);
  }

  private getNumeroSemana(fecha: Date): number {
    const inicio = new Date(fecha.getFullYear(), 0, 1);
    const diff = fecha.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24) / 7);
  }

  exportarExcel() {
    this.gastosService.exportarExcel().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gastos_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  exportarPDF() {
    this.gastosService.exportarPDF().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gastos_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  getNombreCategoria(categoriaId: number | undefined): string {
    if (!categoriaId) return 'Sin categoría';
    const cat = this.categorias.find((c) => c.id === categoriaId);
    return cat ? cat.nombre : 'Sin categoría';
  }
}
