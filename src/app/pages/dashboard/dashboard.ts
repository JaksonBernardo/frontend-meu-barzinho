import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="dashboard-container">
      <app-sidebar activePage="dashboard"></app-sidebar>

      <main class="content">
        <header>
          <h1>Olá, {{ user()?.name || 'Usuário' }}</h1>
          <p>Veja como está seu barzinho hoje.</p>
        </header>
        
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Vendas do Dia</h3>
            <p class="value">R$ 0,00</p>
          </div>
          <div class="stat-card">
            <h3>Pedidos Ativos</h3>
            <p class="value">0</p>
          </div>
          <div class="stat-card warning">
            <h3>Estoque Crítico</h3>
            <p class="value">Nenhum</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      min-height: 100vh;
      background: #f7fafc;
    }
    .content {
      flex: 1;
      padding: 3rem;
      margin-left: 280px;
    }
    h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }
    .content p {
      color: #718096;
      margin-bottom: 3rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #3182ce;
    }
    .stat-card.warning {
      border-left-color: #ecc94b;
    }
    .stat-card h3 {
      font-size: 0.875rem;
      color: #718096;
      margin-bottom: 0.5rem;
    }
    .stat-card .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
    }
  `]
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  user = this.authService.user;
}
