import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { StockService } from '../../../services/stock';
import { SidebarComponent } from '../../../components/sidebar/sidebar';

interface DailyData {
  date: string;
  entries: number;
  exits: number;
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  template: `
    <div class="dashboard-container">
      <app-sidebar activePage="report"></app-sidebar>

      <main class="content">
        <header class="content-header">
          <h1>Movimentações</h1>
          <form [formGroup]="filterForm" (ngSubmit)="loadReport()" class="filter-form">
            <input type="date" formControlName="start_date">
            <input type="date" formControlName="end_date">
            <button type="submit" class="btn-primary">Filtrar</button>
          </form>
        </header>

        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Entradas</h3>
            <p class="value">{{ totalEntries() }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Saídas</h3>
            <p class="value">{{ totalExits() }}</p>
          </div>
        </div>

        <section class="chart-container" *ngIf="dailyData().length > 0">
          <h2>Estoque (R$)</h2>
          <div class="chart-wrapper">
            <div class="chart-area">
              <div class="y-axis">
                <span>{{ maxVal() | currency:'BRL':'symbol':'1.0-0' }}</span>
                <span>{{ (maxVal()/2) | currency:'BRL':'symbol':'1.0-0' }}</span>
                <span>R$ 0</span>
              </div>
              <div class="bars-container">
                <div class="grid-line" style="bottom: 0%"></div>
                <div class="grid-line" style="bottom: 50%"></div>
                <div class="grid-line" style="bottom: 100%"></div>
                
                <div class="day-bar" *ngFor="let day of dailyData()">
                  <div class="bar-pair">
                    <div class="bar entry" [style.height.%]="getPercentage(day.entries)"></div>
                    <div class="bar exit" [style.height.%]="getPercentage(day.exits)"></div>
                  </div>
                  <span class="day-label">{{ day.date }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="legend">
            <span class="legend-item"><span class="box entry"></span> Entradas</span>
            <span class="legend-item"><span class="box exit"></span> Saídas</span>
          </div>
        </section>

        <div class="table-container">
          <table *ngIf="reportData().items?.length > 0; else emptyState">
            <thead>
              <tr>
                <th>Data</th>
                <th>Item</th>
                <th>Tipo</th>
                <th>Qtd</th>
                <th>Preço</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of reportData().items">
                <td>{{ formatDate(item.date || item.date_entry || item.date_exit) }}</td>
                <td>{{ item.item_name }}</td>
                <td>
                  <span class="badge" [class.badge-entry]="item.type === 'ENTRY'" [class.badge-exit]="item.type === 'EXIT'">
                    {{ item.type === 'ENTRY' ? '⬆️ ENTRADA' : '⬇️ SAÍDA' }}
                  </span>
                </td>
                <td>{{ item.qtd }}</td>
                <td>{{ item.price | currency:'BRL' }}</td>
              </tr>
            </tbody>
          </table>
          <ng-template #emptyState>
            <div class="empty-state">
              <p>Nenhuma movimentação encontrada.</p>
            </div>
          </ng-template>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container { display: flex; min-height: 100vh; background: #f7fafc; }
    .content { flex: 1; padding: 3rem; margin-left: 320px; }
    .content-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; }
    h1 { font-size: 2rem; font-weight: 800; color: #1a202c; }
    .filter-form { display: flex; gap: 1rem; align-items: center; }
    .filter-form input { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    .btn-primary { background: #3182ce; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-left: 4px solid #3182ce; }
    .stat-card h3 { font-size: 0.875rem; color: #718096; margin-bottom: 0.5rem; }
    .stat-card .value { font-size: 1.5rem; font-weight: 700; color: #1a202c; }
    
    .chart-container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 2rem; }
    .chart-wrapper { height: 300px; display: flex; flex-direction: column; }
    .chart-area { display: flex; flex: 1; padding: 1rem; position: relative; }
    .y-axis { display: flex; flex-direction: column; justify-content: space-between; height: 250px; font-size: 0.75rem; color: #718096; margin-right: 1rem; }
    .bars-container { display: flex; flex: 1; justify-content: space-around; align-items: flex-end; position: relative; }
    .grid-line { position: absolute; left: 0; right: 0; border-top: 1px solid #e2e8f0; }
    .day-bar { display: flex; flex-direction: column; align-items: center; width: 40px; z-index: 1; }
    .bar-pair { display: flex; gap: 2px; align-items: flex-end; height: 250px; width: 100%; }
    .bar { width: 100%; border-radius: 2px 2px 0 0; }
    .bar.entry { background: #38a169; }
    .bar.exit { background: #e53e3e; }
    .day-label { font-size: 0.75rem; color: #718096; margin-top: 0.5rem; }
    .legend { display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; }
    .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
    .box { width: 12px; height: 12px; border-radius: 2px; }
    .box.entry { background: #38a169; }
    .box.exit { background: #e53e3e; }

    .table-container { background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f7fafc; padding: 1rem; text-align: left; font-size: 0.875rem; color: #718096; border-bottom: 1px solid #e2e8f0; }
    td { padding: 1rem; border-bottom: 1px solid #e2e8f0; color: #1a202c; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 700; }
    .badge-entry { color: #38a169; background: #f0fff4; }
    .badge-exit { color: #e53e3e; background: #fff5f5; }
    .empty-state { padding: 3rem; text-align: center; color: #718096; }
  `]
})
export class ReportComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stockService = inject(StockService);

  filterForm: FormGroup = this.fb.group({
    start_date: [null],
    end_date: [null]
  });

  reportData = signal<any>({});
  
  totalEntries = computed(() => this.reportData().items?.filter((i: any) => i.type === 'ENTRY').length || 0);
  totalExits = computed(() => this.reportData().items?.filter((i: any) => i.type === 'EXIT').length || 0);

  dailyData = computed(() => {
    const items = this.reportData().items || [];
    const map = new Map<string, DailyData>();
    
    items.forEach((i: any) => {
      const date = this.formatDate(i.date || i.date_entry || i.date_exit);
      const data = map.get(date) || { date, entries: 0, exits: 0 };
      if (i.type === 'ENTRY') data.entries += (i.qtd * i.price);
      else data.exits += (i.qtd * i.price);
      map.set(date, data);
    });
    
    return Array.from(map.values()).sort((a,b) => a.date.localeCompare(b.date));
  });
  
  maxVal = computed(() => Math.max(...this.dailyData().map(d => Math.max(d.entries, d.exits)), 1));

  ngOnInit() {
    this.loadReport();
  }

  getPercentage(val: number): number {
    return (val / this.maxVal()) * 100;
  }

  async loadReport() {
    const { start_date, end_date } = this.filterForm.value;
    try {
      const data = await this.stockService.getStockReport(start_date, end_date);
      this.reportData.set(data);
    } catch (e) {
      alert('Erro ao carregar relatório');
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
}
