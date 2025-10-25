import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Calendario } from '../calendario/calendario';
import { Bills } from '../gastos/gastos';
import { Ia } from '../ia/ia';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from "@angular/material/icon";
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Calendario, Bills, Ia, MatTab, MatTabGroup, CommonModule, MatToolbarModule, HttpClientModule, FullCalendarModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
