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
          <div class="chart-header">
            <h2>Movimentação Financeira</h2>
            <div class="legend">
              <span class="legend-item"><span class="box entry"></span> Entradas</span>
              <span class="legend-item"><span class="box exit"></span> Saídas</span>
            </div>
          </div>
          
          <div class="chart-wrapper">
            <div class="y-axis">
              <span>{{ maxVal() | currency:'BRL':'symbol':'1.0-0' }}</span>
              <span>{{ (maxVal() * 0.75) | currency:'BRL':'symbol':'1.0-0' }}</span>
              <span>{{ (maxVal() * 0.5) | currency:'BRL':'symbol':'1.0-0' }}</span>
              <span>{{ (maxVal() * 0.25) | currency:'BRL':'symbol':'1.0-0' }}</span>
              <span>R$ 0</span>
            </div>
            
            <div class="chart-area">
              <div class="grid-lines">
                <div class="grid-line" style="bottom: 0%"></div>
                <div class="grid-line" style="bottom: 25%"></div>
                <div class="grid-line" style="bottom: 50%"></div>
                <div class="grid-line" style="bottom: 75%"></div>
                <div class="grid-line" style="bottom: 100%"></div>
              </div>
              
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="line-chart-svg">
                <defs>
                  <linearGradient id="entryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#48bb78" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#48bb78" stop-opacity="0" />
                  </linearGradient>
                  <linearGradient id="exitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#f56565" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#f56565" stop-opacity="0" />
                  </linearGradient>
                </defs>

                <!-- Áreas -->
                <path [attr.d]="entryArea()" fill="url(#entryGradient)" stroke="none"></path>
                <path [attr.d]="exitArea()" fill="url(#exitGradient)" stroke="none"></path>

                <!-- Linhas -->
                <path [attr.d]="'M ' + entryPoints()" fill="none" stroke="#48bb78" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"></path>
                <path [attr.d]="'M ' + exitPoints()" fill="none" stroke="#f56565" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"></path>
              </svg>

              <div class="points-overlay">
                <div class="day-points" *ngFor="let day of dailyData(); let i = index" [style.left.%]="i * (100 / (dailyData().length - 1 || 1))">
                  <div class="point entry" 
                       [style.bottom.%]="getPercentage(day.entries)"
                       [title]="'Entrada: ' + (day.entries | currency:'BRL')">
                    <div class="tooltip">{{ day.entries | currency:'BRL' }}</div>
                  </div>
                  <div class="point exit" 
                       [style.bottom.%]="getPercentage(day.exits)"
                       [title]="'Saída: ' + (day.exits | currency:'BRL')">
                    <div class="tooltip">{{ day.exits | currency:'BRL' }}</div>
                  </div>
                  <span class="day-label">{{ day.date.split('/')[0] }}/{{ day.date.split('/')[1] }}</span>
                </div>
              </div>
            </div>
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
    
    .chart-container { 
      background: white; 
      padding: 2rem; 
      border-radius: 1.5rem; 
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); 
      margin-bottom: 2rem; 
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .chart-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
    }
    .chart-wrapper { 
      height: 350px; 
      display: flex; 
      gap: 1.5rem;
    }
    .y-axis { 
      display: flex; 
      flex-direction: column; 
      justify-content: space-between; 
      height: 280px; 
      font-size: 0.75rem; 
      color: #a0aec0; 
      text-align: right;
      min-width: 60px;
    }
    .chart-area { 
      flex: 1; 
      position: relative; 
      height: 280px;
    }
    .grid-lines {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .grid-line { 
      position: absolute; 
      left: 0; 
      right: 0; 
      border-top: 1px dashed #edf2f7; 
      width: 100%;
    }
    .line-chart-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .points-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .day-points {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
    }
    .point {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: white;
      border: 2px solid currentColor;
      transform: translate(-50%, 50%);
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s;
      z-index: 5;
    }
    .point.entry { color: #48bb78; }
    .point.exit { color: #f56565; }
    
    .point:hover {
      transform: translate(-50%, 50%) scale(1.5);
      z-index: 10;
    }
    .tooltip {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      background: #2d3748;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s;
      z-index: 10;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .point:hover .tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
    .day-label { 
      position: absolute;
      bottom: -30px;
      transform: translateX(-50%);
      font-size: 0.75rem; 
      font-weight: 600;
      color: #718096; 
      white-space: nowrap;
    }
    .legend { 
      display: flex; 
      gap: 1.5rem; 
    }
    .legend-item { 
      display: flex; 
      align-items: center; 
      gap: 0.5rem; 
      font-size: 0.875rem; 
      color: #4a5568;
      font-weight: 500;
    }
    .box { width: 10px; height: 10px; border-radius: 2px; }
    .box.entry { background: #48bb78; }
    .box.exit { background: #f56565; }

    .table-container { 
      background: white; 
      border-radius: 1.5rem; 
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); 
      overflow: hidden; 
    }
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

  entryPoints = computed(() => this.generatePath('entries'));
  exitPoints = computed(() => this.generatePath('exits'));
  entryArea = computed(() => this.generateAreaPath('entries'));
  exitArea = computed(() => this.generateAreaPath('exits'));

  private generatePath(key: 'entries' | 'exits'): string {
    const data = this.dailyData();
    if (data.length === 0) return '';
    const stepX = 100 / (data.length - 1 || 1);
    return data.map((d, i) => `${i * stepX},${100 - this.getPercentage(d[key])}`).join(' L ');
  }

  private generateAreaPath(key: 'entries' | 'exits'): string {
    const data = this.dailyData();
    if (data.length === 0) return '';
    const stepX = 100 / (data.length - 1 || 1);
    const points = data.map((d, i) => `${i * stepX},${100 - this.getPercentage(d[key])}`).join(' L ');
    return `M 0,100 L ${points} L 100,100 Z`;
  }

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
