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

        <section class="chart-section">
          <div class="section-header">
            <h2>Vendas nos Últimos 7 Dias</h2>
            <p>Desempenho financeiro diário</p>
          </div>

          <div class="bar-chart-container">
            <div class="chart-y-axis">
              <span>{{ maxWeeklyRevenue() | currency:'BRL':'symbol':'1.0-0' }}</span>
              <span>{{ (maxWeeklyRevenue() / 2) | currency:'BRL':'symbol':'1.0-0' }}</span>
              <span>R$ 0</span>
            </div>

            <div class="chart-area">
              <div class="grid-lines">
                <div class="line" style="bottom: 0%"></div>
                <div class="line" style="bottom: 50%"></div>
                <div class="line" style="bottom: 100%"></div>
              </div>

              <div class="bars-container">
                <div class="bar-item" *ngFor="let day of weeklySales()">
                  <div class="bar-wrapper">
                    <div class="bar" 
                         [style.height.%]="getPercentage(day.total)"
                         [class.has-value]="day.total > 0">
                      <div class="bar-tooltip">{{ day.total | currency:'BRL' }}</div>
                    </div>
                  </div>
                  <span class="day-label">{{ day.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container { display: flex; min-height: 100vh; background: #f7fafc; }
    .content { flex: 1; padding: 3rem; margin-left: 320px; max-width: 1200px; }
    .content-header { margin-bottom: 2.5rem; }
    h1 { font-size: 2.25rem; font-weight: 900; color: #1a202c; letter-spacing: -0.025em; margin: 0; }
    .content-header p { color: #718096; font-size: 1.1rem; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .stat-card { background: white; padding: 2rem; border-radius: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border-left: 6px solid #3182ce; transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-2px); }
    .stat-card h3 { font-size: 0.875rem; color: #718096; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
    .stat-card .value { font-size: 2.25rem; font-weight: 900; color: #1a202c; margin: 0; }

    .chart-section { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
    .section-header { margin-bottom: 2.5rem; }
    .section-header h2 { font-size: 1.5rem; font-weight: 800; color: #2d3748; margin: 0; }
    .section-header p { color: #a0aec0; font-size: 0.9rem; margin-top: 0.25rem; }

    .bar-chart-container { display: flex; gap: 2rem; height: 350px; margin-top: 1rem; }
    .chart-y-axis { display: flex; flex-direction: column; justify-content: space-between; padding-bottom: 30px; font-size: 0.75rem; color: #a0aec0; font-weight: 600; text-align: right; min-width: 70px; }
    
    .chart-area { flex: 1; position: relative; padding-bottom: 30px; }
    .grid-lines { position: absolute; inset: 0 0 30px 0; display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; }
    .grid-lines .line { border-top: 1px dashed #edf2f7; width: 100%; }

    .bars-container { position: relative; height: 100%; display: flex; justify-content: space-around; align-items: flex-end; z-index: 1; }
    .bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
    .bar-wrapper { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 10px; }
    
    .bar { 
      width: 40px; 
      background: linear-gradient(to top, #3182ce, #63b3ed); 
      border-radius: 6px 6px 2px 2px; 
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
      opacity: 0.85;
    }
    .bar:hover { opacity: 1; transform: scaleX(1.05); filter: brightness(1.1); }
    .bar.has-value:hover .bar-tooltip { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }

    .bar-tooltip {
      position: absolute; top: -45px; left: 50%; transform: translateX(-50%) translateY(10px);
      background: #2d3748; color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem;
      white-space: nowrap; opacity: 0; visibility: hidden; transition: all 0.2s; z-index: 10;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); font-weight: 700;
    }
    .bar-tooltip::after { content: ''; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #2d3748; }

    .day-label { position: absolute; bottom: 0; font-size: 0.75rem; font-weight: 700; color: #718096; text-transform: uppercase; }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
  user = this.authService.user;

  orders = signal<Order[]>([]);

  weeklySales = computed(() => {
    const orders = this.orders().filter(o => o.status === 'PAGO');
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const total = orders
        .filter(o => (o as any).created_at?.startsWith(dateStr))
        .reduce((acc, o) => acc + this.calculateOrderTotal(o as any), 0);

      days.push({
        label: i === 0 ? 'Hoje' : date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        total
      });
    }
    return days;
  });

  maxWeeklyRevenue = computed(() => {
    const max = Math.max(...this.weeklySales().map(d => d.total));
    return max > 0 ? max * 1.2 : 100; // 20% margin
  });

  todayRevenue = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.orders()
      .filter(o => o.status === 'PAGO' && (o as any).created_at?.startsWith(today))
      .reduce((acc, o) => acc + this.calculateOrderTotal(o as any), 0);
  });

  calculateOrderTotal(order: Order & { order_items?: any[] }): number {
    const items = order.order_items || [];
    return items.reduce((acc: number, item: any) => acc + (item.qtd * parseFloat(item.price)), 0);
  }

  activeOrdersCount = computed(() => this.orders().filter(o => o.status === 'ABERTO').length);

  getPercentage(val: number): number {
    return (val / this.maxWeeklyRevenue()) * 100;
  }

  ngOnInit() {
    this.loadOrders();
  }

  async loadOrders() {
    try {
      const response = await this.orderService.listOrders();
      this.orders.set(response.items || []);
    } catch (e) {
      console.error('Erro ao carregar comandas', e);
    }
  }
}
