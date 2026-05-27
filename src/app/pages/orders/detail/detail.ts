import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { MessageModalComponent } from '../../../components/message-modal/message-modal';
import { OrderService } from '../../../services/order';
import { ItemService, Item } from '../../../services/item';

@Component({
  selector: 'app-orders-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    SidebarComponent,
    MessageModalComponent
  ],
  template: `
    <div class="dashboard-container">
      <app-sidebar activePage="orders"></app-sidebar>

      <main class="content">
        <header class="page-header">
          <div>
            <h1>Comanda #{{ order()?.number }}</h1>
            <div class="description-edit">
              <input type="text" [(ngModel)]="orderDescription" placeholder="Descrição da comanda">
              <button class="btn-primary-small" (click)="updateDescription()">Salvar</button>
            </div>
            <span class="status-badge" [class]="(order()?.status || 'aberto').toLowerCase()">
              {{ order()?.status }}
            </span>
            <p class="subtitle">Gerencie os itens da comanda</p>
          </div>
          <a routerLink="/orders" class="btn-secondary">Voltar</a>
        </header>
        
        <section class="summary-grid">
          <div class="summary-card total-card">
            <span>Total Final</span>
            <strong>{{ finalTotal() | currency:'BRL' }}</strong>
          </div>
          <div class="summary-card">
            <span>Itens</span>
            <strong>{{ totalItems() }}</strong>
          </div>
          <div class="summary-card">
            <span>Produtos</span>
            <strong>{{ order()?.order_items?.length || 0 }}</strong>
          </div>
        </section>

        <section class="add-item-card">
          <div class="section-header">
            <h2>Adicionar Item</h2>
          </div>
          <form [formGroup]="itemForm" (ngSubmit)="addItem()" class="add-item-form">
            <div class="form-group autocomplete-container">
              <label>Produto</label>
              <input type="text" [value]="selectedItemName()" (input)="onItemSearch($event)" placeholder="Buscar produto...">
              <div class="suggestions" *ngIf="itemSuggestions().length > 0">
                <button type="button" class="suggestion-item" *ngFor="let item of itemSuggestions()" (click)="selectItem(item)">
                  <span>{{ item.name }}</span>
                  <strong>{{ item.price | currency:'BRL' }}</strong>
                </button>
              </div>
            </div>
            <div class="form-group qtd-group">
              <label>Qtd</label>
              <input type="number" formControlName="qtd" min="1">
            </div>
            <button type="submit" class="btn-primary" [disabled]="itemForm.invalid">Adicionar</button>
          </form>
        </section>

        <section class="items-section" *ngIf="order()">
          <div class="section-header items-header">
            <h2>Itens</h2>
            <div class="items-total">{{ orderTotal() | currency:'BRL' }}</div>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Unitário</th>
                  <th>Subtotal</th>
                  <th class="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of order().order_items">
                  <td class="item-name">{{ item.item_name }}</td>
                  <td>{{ item.qtd }}</td>
                  <td>{{ item.price | currency:'BRL' }}</td>
                  <td class="subtotal">{{ (item.qtd * item.price) | currency:'BRL' }}</td>
                  <td class="text-right">
                    <button type="button" class="btn-icon-remove" (click)="confirmRemoveItem(item.id)">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="financial-summary">
            <div class="discount-form">
              <select [(ngModel)]="discountType">
                <option value="FIXO">Desconto Fixo (R$)</option>
                <option value="PERCENTUAL">Desconto (%)</option>
              </select>
              <input type="number" [(ngModel)]="discountValue" placeholder="Valor do desconto">
            </div>
            <div class="summary-totals">
              <p>Subtotal: <span>{{ orderTotal() | currency:'BRL' }}</span></p>
              <p>Desconto: <span>{{ calculatedDiscount() | currency:'BRL' }}</span></p>
              <p class="final-total">Total: <span>{{ finalTotal() | currency:'BRL' }}</span></p>
            </div>
          </div>
        </section>

        <section class="close-order-section" *ngIf="order()?.status === 'ABERTO'">
          <div class="section-header">
            <h2>Fechar Comanda</h2>
          </div>
          <div class="close-order-form">
            <select [(ngModel)]="paymentMethod">
              <option value="DINHEIRO">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="DEBITO">Débito</option>
              <option value="CREDITO">Crédito</option>
            </select>
            <button class="btn-success" (click)="closeOrder()">Fechar Comanda</button>
          </div>
        </section>
      </main>

      <div class="modal-overlay" *ngIf="itemToRemove()">
        <div class="modal">
          <h2>Confirmar Remoção</h2>
          <p>Deseja realmente remover este item da comanda?</p>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="itemToRemove.set(null)">Cancelar</button>
            <button class="btn-danger" (click)="removeItem()">Confirmar</button>
          </div>
        </div>
      </div>
      
      <app-message-modal [show]="showMessageModal()" [message]="modalMessage()" (close)="showMessageModal.set(false)"></app-message-modal>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .dashboard-container { display: flex; min-height: 100vh; background: #f7fafc; }
    .content { flex: 1; padding: 3rem; margin-left: 320px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .page-header h1 { font-size: 1.8rem; font-weight: 700; color: #1a202c; display: flex; align-items: center; gap: 1rem; }
    .description-edit { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .description-edit input { padding: 0.4rem; border: 1px solid #e2e8f0; border-radius: 0.4rem; }
    .btn-primary-small { padding: 0.4rem 0.8rem; background: #3182ce; color: white; border: none; border-radius: 0.4rem; cursor: pointer; }
    .subtitle { font-size: 0.92rem; color: #6b7280; }
    
    .status-badge { font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: 999px; text-transform: uppercase; }
    .status-badge.aberto { background: #ebf8ff; color: #3182ce; }
    .status-badge.pago { background: #f0fff4; color: #38a169; }
    .status-badge.cancelado { background: #fff5f5; color: #e53e3e; }
    
    .btn-secondary { background: #edf2f7; color: #4a5568; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; text-decoration: none; }
    
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .summary-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.5rem; }
    .summary-card span { display: block; font-size: 0.8rem; color: #718096; margin-bottom: 0.5rem; }
    .summary-card strong { font-size: 1.5rem; color: #1a202c; }
    
    .add-item-card, .items-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; }
    .section-header { margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .add-item-form { display: grid; grid-template-columns: 1fr 100px 120px; gap: 1rem; align-items: end; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: #4a5568; }
    .form-group input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    .autocomplete-container { position: relative; }
    .suggestions { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 0.5rem; z-index: 100; max-height: 150px; overflow-y: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .suggestion-item { width: 100%; border: none; background: #fff; padding: 0.75rem; cursor: pointer; display: flex; justify-content: space-between; }
    .suggestion-item:hover { background: #f7fafc; }
    
    .btn-primary { height: 44px; border: none; border-radius: 0.5rem; background: #3182ce; color: #fff; font-weight: 600; cursor: pointer; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .btn-icon-remove { background: none; border: none; cursor: pointer; color: #e53e3e; }
    
    .financial-summary { display: flex; justify-content: space-between; padding-top: 1.5rem; border-top: 2px solid #edf2f7; margin-top: 1rem; }
    .discount-form { display: flex; gap: 1rem; align-items: center; }
    .discount-form select, .discount-form input { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.4rem; }
    .summary-totals p { display: flex; justify-content: space-between; gap: 2rem; margin: 0.5rem 0; font-size: 0.95rem; }
    .summary-totals span { font-weight: 600; }
    .final-total { font-size: 1.2rem; font-weight: 800; color: #1a202c; border-top: 1px solid #e2e8f0; padding-top: 0.5rem; }

    .close-order-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.5rem; }
    .close-order-form { display: flex; gap: 1rem; align-items: center; }
    .close-order-form select { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.4rem; }
    .btn-success { background: #38a169; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal { background: white; border-radius: 1rem; width: 400px; padding: 2rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    .btn-danger { background: #e53e3e; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
  `]
})
export class OrdersDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly itemService = inject(ItemService);
  
  orderId = signal<number | null>(null);
  order = signal<any>(null);
  orderDescription = signal('');
  itemSuggestions = signal<Item[]>([]);
  selectedItemName = signal('');
  itemToRemove = signal<number | null>(null);
  showMessageModal = signal(false);
  modalMessage = signal('');
  
  discountType = signal<'FIXO' | 'PERCENTUAL'>('FIXO');
  discountValue = signal(0);
  paymentMethod = signal('DINHEIRO');
  
  itemForm: FormGroup = this.fb.group({
    item_id: [null, [Validators.required]],
    qtd: [1, [Validators.required, Validators.min(1)]],
    price: [null]
  });

  orderTotal = computed(() => {
    const items = this.order()?.order_items || [];
    return items.reduce((acc: number, item: any) => acc + (item.qtd * parseFloat(item.price)), 0);
  });

  calculatedDiscount = computed(() => {
      if (this.discountType() === 'FIXO') return this.discountValue();
      return (this.orderTotal() * this.discountValue()) / 100;
  });

  finalTotal = computed(() => Math.max(0, this.orderTotal() - this.calculatedDiscount()));

  totalItems = computed(() => {
    const items = this.order()?.order_items || [];
    return items.reduce((acc: number, item: any) => acc + item.qtd, 0);
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(parseInt(id, 10));
      this.loadOrder();
    }
  }

  async loadOrder() {
    try {
        const data = await this.orderService.getOrder(this.orderId()!);
        this.order.set(data);
        this.orderDescription.set(data.description || '');
    } catch (e) {
        console.error(e);
    }
  }

  async updateDescription() {
    try {
        await this.orderService.updateOrder(this.orderId()!, { description: this.orderDescription() });
        this.modalMessage.set('Descrição atualizada com sucesso!');
        this.showMessageModal.set(true);
        await this.loadOrder();
    } catch (e: any) {
        this.modalMessage.set(e);
        this.showMessageModal.set(true);
    }
  }

  async onItemSearch(event: any) {
    const term = event.target.value;
    this.selectedItemName.set(term);
    if (term.length > 0) {
      const res = await this.itemService.listItems(10, 0, term);
      this.itemSuggestions.set(res.items);
    } else {
      this.itemSuggestions.set([]);
    }
  }

  selectItem(item: Item) {
    this.selectedItemName.set(item.name);
    this.itemForm.patchValue({ item_id: item.id, price: item.price });
    this.itemSuggestions.set([]);
  }

  async addItem() {
    if(this.itemForm.invalid) return;
    try {
        await this.orderService.addItemToOrder(this.orderId()!, this.itemForm.value);
        this.itemForm.reset({ qtd: 1 });
        this.selectedItemName.set('');
        await this.loadOrder();
    } catch (e: any) {
        this.modalMessage.set(e);
        this.showMessageModal.set(true);
    }
  }

  confirmRemoveItem(orderItemId: number) {
    this.itemToRemove.set(orderItemId);
  }

  async removeItem() {
    const id = this.itemToRemove();
    if (!id) return;
    try {
        await this.orderService.removeItemFromOrder(this.orderId()!, id);
        this.itemToRemove.set(null);
        await this.loadOrder();
    } catch (e: any) {
        this.modalMessage.set(e);
        this.showMessageModal.set(true);
        this.itemToRemove.set(null);
    }
  }

  private readonly router = inject(Router);

  async closeOrder() {
    if (!confirm('Tem certeza que deseja fechar esta comanda? Os itens serão movidos para a parte de VENDAS e a comanda será zerada.')) return;
    
    // As opções enviadas devem ser: 'DINHEIRO', 'PIX', 'DEBITO', 'CREDITO'
    const apiPaymentForm = this.paymentMethod();

    try {
        await this.orderService.updateOrderStatus(this.orderId()!, 'PAGO', apiPaymentForm);
        this.modalMessage.set('Comanda fechada com sucesso! Os itens foram movidos para VENDAS e a comanda foi zerada.');
        this.showMessageModal.set(true);
        // Redireciona após o modal fechar
        setTimeout(() => this.router.navigate(['/orders']), 2000);
    } catch (e: any) {
        this.modalMessage.set(e);
        this.showMessageModal.set(true);
    }
  }
}
