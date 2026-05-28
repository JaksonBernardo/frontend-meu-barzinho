import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { OrderService, Order } from '../../services/order';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, CurrencyPipe],
  template: `
    <div class="dashboard-container">
      <app-sidebar activePage="dashboard"></app-sidebar>

      <main class="content">
        <header class="content-header">
          <h1>Olá, {{ user()?.name || 'Usuário' }}</h1>
          <p>Visão geral do seu barzinho.</p>
        </header>
        
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Vendas de Hoje</h3>
            <p class="value">{{ todayRevenue() | currency:'BRL' }}</p>
          </div>
          <div class="stat-card">
            <h3>Comandas Abertas</h3>
            <p class="value">{{ activeOrdersCount() }}</p>
          </div>
        </div>

        <section class="recent-orders-section">
          <div class="section-header">
            <h2>Vendas Recentes</h2>
            <p>Últimas comandas fechadas</p>
          </div>

          <div class="table-wrapper">
            <div class="table-container">
              <table *ngIf="recentOrders().length > 0; else emptyState">
                <thead>
                  <tr>
                    <th>Comanda</th>
                    <th>Data</th>
                    <th>Forma Pagto.</th>
                    <th>Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let order of recentOrders()">
                    <td class="font-bold">#{{ order.number }}</td>
                    <td>{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>{{ order.payment_form || '---' }}</td>
                    <td class="font-bold text-success">{{ calculateOrderTotal(order) | currency:'BRL' }}</td>
                  </tr>
                </tbody>
              </table>
              <ng-template #emptyState>
                <div class="empty-state">
                  <p>Nenhuma venda registrada recentemente.</p>
                </div>
              </ng-template>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    @media (max-width: 640px) {
      h1 { font-size: 1.75rem; }
      .stat-card .value { font-size: 1.75rem; }
      .recent-orders-section { padding: 1.5rem; }
      .table-wrapper { overflow-x: auto; }
      table { min-width: 600px; }
    }

    .content-header { margin-bottom: 2.5rem; }
    h1 { font-size: 2.25rem; font-weight: 900; color: #1a202c; letter-spacing: -0.025em; margin: 0; }
    .content-header p { color: #718096; font-size: 1.1rem; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .stat-card { background: white; padding: 2rem; border-radius: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border-left: 6px solid #3182ce; transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-2px); }
    .stat-card h3 { font-size: 0.875rem; color: #718096; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
    .stat-card .value { font-size: 2.25rem; font-weight: 900; color: #1a202c; margin: 0; }

    .recent-orders-section { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
    .section-header { margin-bottom: 2rem; }
    .section-header h2 { font-size: 1.5rem; font-weight: 800; color: #2d3748; margin: 0; }
    .section-header p { color: #a0aec0; font-size: 0.9rem; margin-top: 0.25rem; }

    .table-wrapper { width: 100%; border-radius: 1rem; overflow: hidden; border: 1px solid #edf2f7; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 800; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 1rem 1.5rem; border-bottom: 1px solid #edf2f7; color: #2d3748; font-size: 0.9375rem; }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: #f8fafc; }
    
    .font-bold { font-weight: 700; }
    .text-success { color: #38a169; }
    .empty-state { padding: 3rem; text-align: center; color: #a0aec0; }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  user = this.authService.user;

  orders = signal<Order[]>([]);

  recentOrders = computed(() => {
    return [...this.orders()]
      .filter(o => o.status === 'PAGO')
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  });

  todayRevenue = computed(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const filtered = this.orders().filter(o => {
      const isPaid = o.status === 'PAGO';
      const isToday = o.created_at?.startsWith(today);
      return isPaid && isToday;
    });

    console.log('Today Revenue Debug:', { today, totalOrders: this.orders().length, filteredCount: filtered.length });
    
    return filtered.reduce((acc, o) => acc + this.calculateOrderTotal(o), 0);
  });

  calculateOrderTotal(order: Order): number {
    const items = order.order_items || [];
    return items.reduce((acc: number, item: any) => acc + (item.qtd * parseFloat(item.price)), 0);
  }

  activeOrdersCount = computed(() => this.orders().filter(o => o.status === 'ABERTO').length);

  ngOnInit() {
    this.loadOrders();
  }

  async loadOrders() {
    try {
      const response = await this.orderService.listOrders(100); // Busca as últimas 100 comandas
      this.orders.set(response.items || []);
    } catch (e) {
      console.error('Erro ao carregar comandas', e);
    }
  }
}
