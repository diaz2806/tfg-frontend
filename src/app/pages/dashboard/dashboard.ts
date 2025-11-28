import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Calendario } from '../calendario/calendario';
import { Bills } from '../gastos/gastos';
import { Ia } from '../ia/ia';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EditarPerfilDialogComponent } from '../editar-perfil-dialog/editar-perfil-dialog';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    Calendario,
    Bills,
    Ia,
    MatTab,
    MatTabGroup,
    CommonModule,
    MatToolbarModule,
    HttpClientModule,
    FullCalendarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  nombreUsuario: string = 'Usuario';
  emailUsuario: string = '';
  idUsuario: number = 0;

  constructor(private router: Router, private dialog: MatDialog) {}

  ngOnInit() {
    // Obtener datos del usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.nombreUsuario = usuario.nombre || 'Usuario';
    this.emailUsuario = usuario.email || '';
    this.idUsuario = usuario.id || 0;
  }

  abrirPerfil() {
    const dialogRef = this.dialog.open(EditarPerfilDialogComponent, {
      width: '500px',
      data: {
        id: this.idUsuario,
        nombre: this.nombreUsuario,
        email: this.emailUsuario,
      },
    });

    dialogRef.afterClosed().subscribe((usuarioActualizado) => {
      if (usuarioActualizado) {
        // Actualizar datos en la UI
        this.nombreUsuario = usuarioActualizado.nombre;
        this.emailUsuario = usuarioActualizado.email;
        console.log('✅ Perfil actualizado en la UI');
      }
    });
  }

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
