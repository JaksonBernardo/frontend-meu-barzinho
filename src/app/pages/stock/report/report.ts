import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { StockService } from '../../../services/stock';
import { SaleService, SalePublic } from '../../../services/sale';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DailyData {
  date: string;
  entries: number;
  exits: number;
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  providers: [SaleService],
  styleUrl: './report.css',
  template: `
    <div class="dashboard-container">
      <app-sidebar activePage="report"></app-sidebar>

      <main class="content">
        <header class="content-header">
          <div class="header-titles">
            <h1>Relatório Executivo</h1>
            <p class="subtitle">Análise de Performance e Saúde Financeira</p>
          </div>
          
          <div class="header-actions">
            <form [formGroup]="filterForm" (ngSubmit)="loadReport()" class="filter-form">
              <div class="select-group">
                <select formControlName="month">
                  <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
                </select>
                <select formControlName="year">
                  <option *ngFor="let y of years" [value]="y">{{ y }}</option>
                </select>
              </div>
              <button type="submit" class="btn-primary">Filtrar</button>
            </form>
            <button class="btn-export" (click)="exportToPDF()" [disabled]="salesData().length === 0 && (reportData().items || []).length === 0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon-btn">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportar PDF
            </button>
          </div>
        </header>

        <div class="kpi-grid">
          <div class="kpi-card revenue">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m0 0V4.5m0 12.75V4.5m16.5 0v15M12 4.5v15m7.5-9h-15" />
              </svg>
            </div>
            <div class="kpi-info">
              <h3>Receita Bruta</h3>
              <p class="value">{{ financialSummary().revenue | currency:'BRL' }}</p>
              <span class="trend pos">Inflow de vendas</span>
            </div>
          </div>

          <div class="kpi-card costs">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75V18m-3-3V18m-3-3V18M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div class="kpi-info">
              <h3>Custos Operacionais</h3>
              <p class="value">{{ financialSummary().costs | currency:'BRL' }}</p>
              <span class="trend neg">Inflow de estoque</span>
            </div>
          </div>

          <div class="kpi-card profit" [class.negative]="financialSummary().profit < 0">
            <div class="kpi-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div class="kpi-info">
              <h3>Margem de Contribuição</h3>
              <p class="value">{{ financialSummary().profit | currency:'BRL' }}</p>
              <span class="trend" [class.pos]="financialSummary().profit >= 0" [class.neg]="financialSummary().profit < 0">
                Percentual: {{ financialSummary().margin | number:'1.1-1' }}%
              </span>
            </div>
          </div>
        </div>

        <section class="chart-container" *ngIf="dailyData().length > 0">
          <div class="chart-header">
            <div class="chart-title">
              <h2>Tendência Mensal</h2>
              <p>Comparativo diário de Receita vs Custos</p>
            </div>
            <div class="legend">
              <span class="legend-item"><span class="box entry"></span> Custos (Entradas)</span>
              <span class="legend-item"><span class="box exit"></span> Receita (Vendas)</span>
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
                    <stop offset="0%" stop-color="#f56565" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#f56565" stop-opacity="0" />
                  </linearGradient>
                  <linearGradient id="exitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#48bb78" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#48bb78" stop-opacity="0" />
                  </linearGradient>
                </defs>

                <!-- Áreas -->
                <path [attr.d]="entryArea()" fill="url(#entryGradient)" stroke="none"></path>
                <path [attr.d]="exitArea()" fill="url(#exitGradient)" stroke="none"></path>

                <!-- Linhas -->
                <path [attr.d]="'M ' + entryPoints()" fill="none" stroke="#f56565" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"></path>
                <path [attr.d]="'M ' + exitPoints()" fill="none" stroke="#48bb78" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"></path>
              </svg>

              <div class="points-overlay">
                <div class="day-points" *ngFor="let day of dailyData(); let i = index" [style.left.%]="i * (100 / (dailyData().length - 1 || 1))">
                  <div class="point entry" 
                       [style.bottom.%]="getPercentage(day.entries)"
                       [title]="'Custo: ' + (day.entries | currency:'BRL')">
                    <div class="tooltip">Custo: {{ day.entries | currency:'BRL' }}</div>
                  </div>
                  <div class="point exit" 
                       [style.bottom.%]="getPercentage(day.exits)"
                       [title]="'Receita: ' + (day.exits | currency:'BRL')">
                    <div class="tooltip">Receita: {{ day.exits | currency:'BRL' }}</div>
                  </div>
                  <span class="day-label">{{ day.date.split('/')[0] }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="today-sales-card" *ngIf="todaySalesTotal() > 0">
          <div class="kpi-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div class="kpi-info">
            <h3>Vendas de Hoje</h3>
            <p class="value">{{ todaySalesTotal() | currency:'BRL' }}</p>
          </div>
        </div>

        <div class="table-container">
          <div class="table-header">
            <h2>Detalhamento das Operações</h2>
          </div>
          <div class="table-wrapper">
            <table *ngIf="mergedData().length > 0; else emptyState">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Item / Comanda</th>
                  <th>Operação</th>
                  <th>Qtd</th>
                  <th>Vlr Unitário</th>
                  <th>Vlr Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of mergedData()">
                  <td>{{ formatDate(item.date) }}</td>
                  <td class="item-name">{{ item.item_name }}</td>
                  <td>
                    <span class="badge" [class.badge-entry]="item.type === 'ENTRY'" [class.badge-exit]="item.type === 'SALE'">
                      {{ item.type === 'ENTRY' ? 'Entrada (Custo)' : 'Venda (Receita)' }}
                    </span>
                  </td>
                  <td>{{ item.qtd }}</td>
                  <td>{{ item.price | currency:'BRL' }}</td>
                  <td class="font-bold">{{ item.total | currency:'BRL' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #emptyState>
            <div class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-2.24-1.8-4.074-4.048-4.14a48.423 48.423 0 0 0-11.404 0C4.05 9.886 2.25 11.72 2.25 13.962Z" />
              </svg>
              <p>Nenhuma movimentação encontrada para o período selecionado.</p>
            </div>
          </ng-template>
        </div>
      </main>
    </div>
  `
})
export class ReportComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stockService = inject(StockService);
  private readonly saleService = inject(SaleService);

  months = [
    { value: '01', label: 'Janeiro' }, { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' }, { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' }, { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' }, { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' }, { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' }
  ];

  years = [2024, 2025, 2026];

  filterForm: FormGroup = this.fb.group({
    month: [String(new Date().getMonth() + 1).padStart(2, '0')],
    year: [new Date().getFullYear()]
  });

  reportData = signal<any>({});
  salesData = signal<SalePublic[]>([]);
  
  todaySalesTotal = computed(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    return this.salesData()
      .filter(s => s.created_at?.startsWith(today))
      .reduce((acc, s) => acc + (parseFloat(String(s.total_value)) || 0), 0);
  });

  financialSummary = computed(() => {
    const stockItems = this.reportData().items || [];
    const sales = this.salesData() || [];
    
    let revenue = 0;
    let costs = 0;
    
    stockItems.forEach((i: any) => {
      if (i.type === 'ENTRY') {
        const price = parseFloat(String(i.price)) || 0;
        const qtd = parseFloat(String(i.qtd)) || 0;
        costs += (qtd * price);
      }
    });

    sales.forEach((s) => {
      const val = parseFloat(String(s.total_value)) || 0;
      revenue += val;
    });
    
    const profit = revenue - costs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    return { revenue, costs, profit, margin };
  });

  dailyData = computed(() => {
    const stockItems = this.reportData().items || [];
    const sales = this.salesData() || [];
    const map = new Map<string, DailyData>();
    
    stockItems.forEach((i: any) => {
      if (i.type === 'ENTRY') {
        const date = this.formatDate(i.date || i.date_entry || i.date_exit);
        if (!date) return;
        const data = map.get(date) || { date, entries: 0, exits: 0 };
        const price = parseFloat(String(i.price)) || 0;
        const qtd = parseFloat(String(i.qtd)) || 0;
        data.entries += (qtd * price);
        map.set(date, data);
      }
    });

    sales.forEach((s) => {
      if (!s.created_at) return;
      const saleDate = new Date(s.created_at);
      if (isNaN(saleDate.getTime())) return;
      
      const date = `${String(saleDate.getDate()).padStart(2, '0')}/${String(saleDate.getMonth() + 1).padStart(2, '0')}/${saleDate.getFullYear()}`;
      const data = map.get(date) || { date, entries: 0, exits: 0 };
      const val = parseFloat(String(s.total_value)) || 0;
      data.exits += val;
      map.set(date, data);
    });
    
    return Array.from(map.values()).sort((a,b) => {
      const partsA = a.date.split('/');
      const partsB = b.date.split('/');
      if (partsA.length !== 3 || partsB.length !== 3) return 0;
      const dateA = new Date(`${partsA[2]}-${partsA[1]}-${partsA[0]}`).getTime();
      const dateB = new Date(`${partsB[2]}-${partsB[1]}-${partsB[0]}`).getTime();
      return dateA - dateB;
    });
  });
  
  maxVal = computed(() => {
    const data = this.dailyData();
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => Math.max(d.entries, d.exits)), 1);
  });

  mergedData = computed(() => {
    const stockItems = (this.reportData().items || []).filter((i: any) => i.type === 'ENTRY');
    const sales = this.salesData() || [];

    const salesItems = sales.map((s) => {
      const price = parseFloat(String(s.item_price)) || 0;
      const total = parseFloat(String(s.total_value)) || 0;
      return {
        date: s.created_at ? s.created_at.split('T')[0] : '',
        item_name: `${s.item_name} (Comanda #${s.order_number})`,
        type: 'SALE',
        qtd: s.qtd || 0,
        price: price,
        total: total
      };
    }).filter((s: any) => s.date);

    const entryItems = stockItems.map((i: any) => {
      const price = parseFloat(String(i.price)) || 0;
      const qtd = parseFloat(String(i.qtd)) || 0;
      return {
        date: i.date || i.date_entry || '',
        item_name: i.item_name,
        type: 'ENTRY',
        qtd: qtd,
        price: price,
        total: qtd * price
      };
    }).filter((i: any) => i.date);

    return [...entryItems, ...salesItems].sort((a, b) => b.date.localeCompare(a.date));
  });

  productBreakdown = computed(() => {
    const map = new Map<string, { qtd: number, total: number }>();
    (this.salesData() || []).forEach(s => {
      const curr = map.get(s.item_name) || { qtd: 0, total: 0 };
      curr.qtd += s.qtd;
      curr.total += parseFloat(String(s.total_value)) || 0;
      map.set(s.item_name, curr);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].qtd - a[1].qtd);
  });

  paymentBreakdown = computed(() => {
    const map = new Map<string, number>();
    (this.salesData() || []).forEach(s => {
      const form = s.payment_form || 'OUTRO';
      const val = parseFloat(String(s.total_value)) || 0;
      map.set(form, (map.get(form) || 0) + val);
    });
    return Array.from(map.entries());
  });

  topSellingProduct = computed(() => this.productBreakdown()[0] || null);

  entryPoints = computed(() => this.generatePath('entries'));
  exitPoints = computed(() => this.generatePath('exits'));
  entryArea = computed(() => this.generateAreaPath('entries'));
  exitArea = computed(() => this.generateAreaPath('exits'));

  private generatePath(key: 'entries' | 'exits'): string {
    const data = this.dailyData();
    if (data.length === 0) return '';
    if (data.length === 1) return `0,${100 - this.getPercentage(data[0][key])} L 100,${100 - this.getPercentage(data[0][key])}`;
    const stepX = 100 / (data.length - 1 || 1);
    return data.map((d, i) => `${i * stepX},${100 - this.getPercentage(d[key])}`).join(' L ');
  }

  private generateAreaPath(key: 'entries' | 'exits'): string {
    const data = this.dailyData();
    if (data.length === 0) return '';
    const points = this.generatePath(key);
    return `M 0,100 L ${points} L 100,100 Z`;
  }

  ngOnInit() {
    this.loadReport();
  }

  getPercentage(val: number): number {
    const max = this.maxVal();
    if (max === 0) return 0;
    return (val / max) * 100;
  }

  async loadReport() {
    const { month, year } = this.filterForm.value;
    const start_date = `${year}-${month}-01`;
    const lastDay = new Date(year, parseInt(month), 0).getDate();
    const end_date = `${year}-${month}-${lastDay}`;
    
    try {
      const [stockData, salesData] = await Promise.all([
        this.stockService.getStockReport(start_date, end_date),
        this.saleService.listSalesByPeriod(start_date, end_date)
      ]);
      
      this.reportData.set(stockData);
      this.salesData.set(salesData || []);
    } catch (e) {
      alert('Erro ao carregar relatório');
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  exportToPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');
    const { month, year } = this.filterForm.value;
    const summary = this.financialSummary();
    const monthLabel = this.months.find(m => m.value === month)?.label;

    // Header
    doc.setFillColor(26, 32, 44);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Relatório Executivo Financeiro', 15, 20);
    doc.setFontSize(12);
    doc.text(`Período: ${monthLabel} de ${year}`, 15, 30);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 150, 30);

    // KPI Section
    doc.setTextColor(26, 32, 44);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo de Performance', 15, 55);

    autoTable(doc, {
      startY: 60,
      head: [['Métrica', 'Valor', 'Impacto']],
      body: [
        ['Receita Bruta (Vendas)', this.formatCurrency(summary.revenue), 'Entrada de Capital'],
        ['Custos Operacionais (Estoque)', this.formatCurrency(summary.costs), 'Saída de Capital'],
        ['Lucro Líquido', this.formatCurrency(summary.profit), summary.profit >= 0 ? 'Resultado Positivo' : 'Resultado Negativo'],
        ['Margem Operacional', `${summary.margin.toFixed(2)}%`, 'Eficiência']
      ],
      theme: 'grid',
      headStyles: { fillColor: [45, 55, 72] }
    });

    // Breakdown Section
    const breakdownTitleY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Análise por Produto e Pagamento', 15, breakdownTitleY);
    
    const topProd = this.topSellingProduct();
    let tablesStartY = breakdownTitleY + 10;
    
    if (topProd) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Destaque: O produto mais vendido foi ${topProd[0]} com ${topProd[1].qtd} unidades.`, 15, breakdownTitleY + 7);
      tablesStartY += 5;
    }

    // Product Table
    autoTable(doc, {
      startY: tablesStartY,
      head: [['Produto', 'Qtd Vendida', 'Total Recebido']],
      body: this.productBreakdown().map(p => [p[0], p[1].qtd, this.formatCurrency(p[1].total)]),
      theme: 'striped',
      headStyles: { fillColor: [49, 130, 206] },
      margin: { right: 110 },
      styles: { fontSize: 8 }
    });

    const productTableFinalY = (doc as any).lastAutoTable.finalY;

    // Payment Table (Side by side)
    autoTable(doc, {
      startY: tablesStartY,
      head: [['Forma de Pagamento', 'Total']],
      body: this.paymentBreakdown().map(p => [this.translatePayment(p[0]), this.formatCurrency(p[1])]),
      theme: 'striped',
      headStyles: { fillColor: [56, 161, 105] },
      margin: { left: 110 },
      styles: { fontSize: 8 }
    });

    const paymentTableFinalY = (doc as any).lastAutoTable.finalY;
    const maxTablesY = Math.max(productTableFinalY, paymentTableFinalY);

    // Detailed Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalhamento de Movimentações (Entradas e Vendas)', 15, maxTablesY + 15);

    const tableData = this.mergedData().map((i: any) => [
      this.formatDate(i.date),
      i.item_name,
      i.type === 'ENTRY' ? 'Entrada (Custo)' : 'Venda (Receita)',
      i.qtd,
      this.formatCurrency(i.price),
      this.formatCurrency(i.total)
    ]);

    autoTable(doc, {
      startY: maxTablesY + 20,
      head: [['Data', 'Descrição', 'Operação', 'Qtd', 'Vlr Unit', 'Total']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [45, 55, 72] }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('Meu Barzinho - Sistema de Gestão', 15, 285);
      doc.text(`Página ${i} de ${pageCount}`, 180, 285);
    }

    doc.save(`Relatorio_Executivo_${month}_${year}.pdf`);
  }

  private formatCurrency(val: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  }

  private translatePayment(form: string): string {
    const map: any = {
      'CASH': 'Dinheiro',
      'DINHEIRO': 'Dinheiro',
      'PIX': 'PIX',
      'DEBIT': 'Débito',
      'DEBITO': 'Débito',
      'CREDIT': 'Crédito',
      'CREDITO': 'Crédito'
    };
    return map[form] || form;
  }
}
