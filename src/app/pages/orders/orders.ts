import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router as NgRouter } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { MessageModalComponent } from '../../components/message-modal/message-modal';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal';
import { OrderService, Order } from '../../services/order';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    SidebarComponent, 
    MessageModalComponent, 
    ConfirmationModalComponent
  ],
  styleUrl: './orders.css',
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
              <div class="header-actions">
                <span class="status-badge" [class]="(order.status || 'aberto').toLowerCase()">
                  <span class="dot"></span>
                  {{ order.status }}
                </span>
                <button class="btn-icon-delete" (click)="deleteOrder($event, order.id!)" title="Deletar Comanda">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
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
          <h2>Nova Comanda</h2>
          <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Número</label>
              <input type="number" formControlName="number">
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <input type="text" formControlName="description">
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" type="button" (click)="closeModal()">Cancelar</button>
              <button class="btn-primary" type="submit" [disabled]="loading()">Criar</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Modais de Feedback -->
      <app-confirmation-modal 
        [show]="showDeleteModal()" 
        title="Confirmar Exclusão" 
        message="Tem certeza que deseja excluir esta comanda?"
        (confirm)="executeDeleteOrder()"
        (cancel)="showDeleteModal.set(false); orderToDelete.set(null)">
      </app-confirmation-modal>
      
      <app-message-modal [show]="showMessageModal()" [message]="modalMessage()" (close)="showMessageModal.set(false)"></app-message-modal>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(NgRouter);

  orders = signal<Order[]>([]);
  loading = signal(false);
  showModal = signal(false);
  showMessageModal = signal(false);
  modalMessage = signal('');
  showDeleteModal = signal(false);
  orderToDelete = signal<number | null>(null);

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

  async deleteOrder(event: Event, orderId: number) {
    event.stopPropagation();
    this.orderToDelete.set(orderId);
    this.showDeleteModal.set(true);
  }

  async executeDeleteOrder() {
    const orderId = this.orderToDelete();
    if (!orderId) return;

    this.showDeleteModal.set(false);
    this.orderToDelete.set(null);

    try {
      await this.orderService.deleteOrder(orderId);
      this.loadOrders();
    } catch (e: any) {
      this.modalMessage.set(e || 'Erro ao excluir comanda');
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
      this.orderForm.reset({ status: 'ABERTO', type_discount: 'FIXO', discount: 0.00, payment_form: 'DINHEIRO' });
      const user = this.authService.user() as { company_id: number } | null;
      if (user) this.orderForm.patchValue({ company_id: user.company_id });
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
