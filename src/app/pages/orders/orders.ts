import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router as NgRouter } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { MessageModalComponent } from '../../components/message-modal/message-modal';
import { OrderService, Order } from '../../services/order';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, MessageModalComponent],
  template: `
    <div class="dashboard-container">
      <app-sidebar activePage="orders"></app-sidebar>

      <main class="content">
        <header class="content-header">
          <h1>Comandas</h1>
          <button class="btn-primary" (click)="openModal()">+ Nova Comanda</button>
        </header>

        <div class="orders-grid">
          <div *ngFor="let order of orders()" 
               class="order-card" 
               [class]="(order.status || 'aberto').toLowerCase()" 
               (click)="goToDetail(order.id!)">
            
            <div class="card-header">
              <div class="order-info">
                <span class="order-label">Comanda</span>
                <span class="order-number">#{{ order.number }}</span>
              </div>
              <span class="status-badge" [class]="(order.status || 'aberto').toLowerCase()">
                <span class="dot"></span>
                {{ order.status }}
              </span>
            </div>

            <div class="card-body">
              <p class="order-desc">{{ order.description || 'Sem descrição' }}</p>
              <div class="order-meta">
                <div class="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="meta-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                  </svg>
                  <span>{{ order.payment_form || 'Não definido' }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="total-section">
                <span class="total-label">Valor Total</span>
                <span class="total-value">{{ calculateOrderTotal(order) | currency:'BRL' }}</span>
              </div>
              <div class="action-hint">
                Ver detalhes
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="arrow-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Modal de Criação -->
      <div class="modal-overlay" *ngIf="showModal()">
        <div class="modal">
          <header>
            <h2>Nova Comanda</h2>
            <button class="btn-close" (click)="closeModal()">X</button>
          </header>

          <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Número</label>
              <input type="number" formControlName="number">
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <input type="text" formControlName="description" placeholder="Ex: nome...">
            </div>
            <div class="form-group">
              <label>Forma de Pagamento</label>
              <select formControlName="payment_form">
                <option value="DINHEIRO">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="DEBITO">Débito</option>
                <option value="CREDITO">Crédito</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select formControlName="status">
                <option value="ABERTO">Aberto</option>
                <option value="PAGO">Pago</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="orderForm.invalid || loading()">
                {{ loading() ? 'Criando...' : 'Criar Comanda' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      <app-message-modal [show]="showMessageModal()" [message]="modalMessage()" (close)="closeMessageModal()"></app-message-modal>
    </div>
  `,
  styles: [`
    .dashboard-container { display: flex; min-height: 100vh; background: #f7fafc; }
    .content { flex: 1; padding: 3rem; margin-left: 320px; }
    .content-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; }
    h1 { font-size: 2rem; font-weight: 800; color: #1a202c; }
    .btn-primary { background: #3182ce; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
    
    .orders-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
      gap: 1.5rem; 
    }
    .order-card { 
      background: white; 
      border-radius: 1.25rem; 
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid #edf2f7;
      display: flex;
      flex-direction: column;
      cursor: pointer;
    }
    .order-card:hover { 
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border-color: #cbd5e0;
    }

    .card-header {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      transition: background-color 0.3s ease;
    }
    .order-card.aberto .card-header { background-color: #ebf8ff; }
    .order-card.pago .card-header { background-color: #f0fff4; }
    .order-card.cancelado .card-header { background-color: #fff5f5; }

    .order-info {
      display: flex;
      flex-direction: column;
    }
    .order-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .order-card.aberto .order-label { color: #2b6cb0; }
    .order-card.pago .order-label { color: #2f855a; }
    .order-card.cancelado .order-label { color: #c53030; }

    .order-number { 
      font-size: 1.25rem; 
      font-weight: 800; 
      color: #1a202c; 
    }

    .status-badge { 
      font-size: 0.75rem; 
      font-weight: 700; 
      padding: 0.4rem 0.8rem; 
      border-radius: 999px; 
      display: flex;
      align-items: center;
      gap: 0.4rem;
      text-transform: uppercase;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .status-badge .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .status-badge.aberto { background: #e6f6ff; color: #2b6cb0; }
    .status-badge.aberto .dot { background: #3182ce; }
    .status-badge.pago { background: #f0fff4; color: #2f855a; }
    .status-badge.pago .dot { background: #38a169; }
    .status-badge.cancelado { background: #fff5f5; color: #c53030; }
    .status-badge.cancelado .dot { background: #e53e3e; }

    .card-body {
      padding: 1.5rem;
      flex: 1;
    }
    .order-desc { 
      color: #2d3748; 
      font-size: 1rem; 
      font-weight: 500;
      margin-bottom: 1rem; 
      line-height: 1.5; 
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .order-meta {
      display: flex;
      gap: 1rem;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: #718096;
      font-weight: 500;
      background: #f7fafc;
      padding: 0.25rem 0.6rem;
      border-radius: 0.5rem;
    }
    .meta-icon {
      width: 1rem;
      height: 1rem;
    }

    .card-footer { 
      padding: 1.25rem 1.5rem;
      background: white;
      border-top: 1px solid #edf2f7;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-section {
      display: flex;
      flex-direction: column;
    }
    .total-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #a0aec0;
    }
    .total-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: #2d3748;
    }
    .action-hint {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 700;
      color: #3182ce;
      transition: all 0.2s;
    }
    .order-card:hover .action-hint {
      gap: 0.6rem;
    }
    .arrow-icon {
      width: 1rem;
      height: 1rem;
    }

    .modal-overlay { 
      position: fixed; 
      top: 0; 
      left: 0; 
      width: 100%; 
      height: 100%; 
      background: rgba(26, 32, 44, 0.6); 
      backdrop-filter: blur(4px);
      display: flex; 
      align-items: center; 
      justify-content: center; 
      z-index: 1000; 
    }
    .modal { background: white; border-radius: 1rem; width: 450px; padding: 2.5rem; }
    .form-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group input, .form-group select { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 1rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2.5rem; }
    .btn-secondary { background: #edf2f7; color: #4a5568; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
  `]
})
export class OrdersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(NgRouter);

  orders = signal<Order[]>([]);
  showModal = signal(false);
  loading = signal(false);
  showMessageModal = signal(false);
  modalMessage = signal('');

  orderForm: FormGroup = this.fb.group({
    number: [null, [Validators.required]],
    description: [''],
    status: ['ABERTO'],
    type_discount: ['FIXO'],
    discount: [0.00],
    payment_form: ['DINHEIRO', [Validators.required]],
    company_id: [0]
  });

  ngOnInit() {
    this.loadOrders();
    const user = this.authService.user() as { company_id: number } | null;
    if (user) {
      this.orderForm.patchValue({ company_id: user.company_id });
    }
  }

  async loadOrders() {
    try {
      const response = await this.orderService.listOrders();
      this.orders.set(response.items || []);
    } catch (e) {
      console.error(e);
      this.modalMessage.set('Erro ao carregar comandas');
      this.showMessageModal.set(true);
    }
  }

  calculateOrderTotal(order: Order & { order_items?: any[] }): number {
    const items = order.order_items || [];
    return items.reduce((acc: number, item: any) => acc + (item.qtd * parseFloat(item.price)), 0);
  }

  goToDetail(orderId: number) {
    this.router.navigate(['/orders', orderId]);
  }

  openModal() { this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }
  closeMessageModal() { this.showMessageModal.set(false); }

  async onSubmit() {
    if (this.orderForm.invalid) return;
    this.loading.set(true);
    try {
      await this.orderService.createOrder(this.orderForm.value);
      this.modalMessage.set('Comanda criada com sucesso!');
      this.showMessageModal.set(true);
      await this.loadOrders();
      this.closeModal();
    } catch (e: any) {
      this.modalMessage.set(e || 'Erro ao criar comanda');
      this.showMessageModal.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
