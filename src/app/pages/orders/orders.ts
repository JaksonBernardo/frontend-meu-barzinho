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
          <div *ngFor="let order of orders()" class="order-card" (click)="goToDetail(order.id!)" style="cursor: pointer;">
            <div class="order-header">
              <span class="order-number">#{{ order.number }}</span>
              <span class="status-badge" [class]="(order.status || 'aberto').toLowerCase()">{{ order.status }}</span>
            </div>
            <p class="order-desc">{{ order.description }}</p>
            <div class="order-footer">
              <span>{{ order.payment_form }}</span>
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
    
    .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
    .order-card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); transition: transform 0.2s; }
    .order-card:hover { transform: translateY(-5px); }
    .modal header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .btn-close { background: none; border: none; font-size: 1.5rem; color: #a0aec0; cursor: pointer; padding: 0.5rem; transition: color 0.2s; }
    .btn-close:hover { color: #1a202c; }
    .order-number { font-size: 1.5rem; font-weight: 800; color: #1a202c; }
    .status-badge { font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: 999px; text-transform: uppercase; }
    .status-badge.aberto { background: #ebf8ff; color: #3182ce; }
    .status-badge.pago { background: #f0fff4; color: #38a169; }
    .status-badge.cancelado { background: #fff5f5; color: #e53e3e; }
    .order-desc { color: #4a5568; font-size: 1.1rem; margin-bottom: 1.5rem; line-height: 1.6; }
    .order-footer { font-size: 0.9rem; color: #718096; font-weight: 600; padding-top: 1rem; border-top: 1px solid #edf2f7; }

    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
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
