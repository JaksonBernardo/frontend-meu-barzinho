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
    :host {
      display: block;
      width: 100%;
    }

    * {
      box-sizing: border-box;
    }

    .dashboard-container {
      display: flex;
      min-height: 100vh;
      background: #f7fafc;
    }

    /* ===== CONTENT ===== */

    .content {
      flex: 1;
      width: 100%;
      overflow-x: hidden;
      padding: 2rem;
    }

    /* ===== HEADER ===== */

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 800;
      color: #1a202c;
      line-height: 1.2;
    }

    .subtitle {
      margin-top: 0.5rem;
      color: #718096;
      font-size: 0.95rem;
    }

    .description-edit {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      margin-bottom: 0.75rem;
    }

    .description-edit input {
      width: 320px;
      height: 46px;
      padding: 0 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      background: #fff;
      font-size: 15px;
      transition: all 0.2s ease;
    }

    .description-edit input:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.25rem;
      padding: 0.45rem 0.9rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .status-badge.aberto {
      background: #ebf8ff;
      color: #3182ce;
    }

    .status-badge.pago {
      background: #f0fff4;
      color: #38a169;
    }

    .status-badge.cancelado {
      background: #fff5f5;
      color: #e53e3e;
    }

    /* ===== BUTTONS ===== */

    .btn-primary,
    .btn-secondary,
    .btn-success,
    .btn-danger,
    .btn-primary-small {
      min-height: 48px;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary,
    .btn-primary-small {
      background: #3182ce;
      color: #fff;
    }

    .btn-primary:hover,
    .btn-primary-small:hover {
      background: #2b6cb0;
    }

    .btn-primary {
      padding: 0 1.25rem;
    }

    .btn-primary-small {
      padding: 0 1rem;
      min-height: 46px;
    }

    .btn-secondary {
      background: #edf2f7;
      color: #4a5568;
      padding: 0 1.25rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .btn-success {
      background: #38a169;
      color: #fff;
      padding: 0 1.5rem;
    }

    .btn-success:hover {
      background: #2f855a;
    }

    .btn-danger {
      background: #e53e3e;
      color: #fff;
      padding: 0 1.25rem;
    }

    .btn-danger:hover {
      background: #c53030;
    }

    /* ===== TOTAL CARDS ===== */

    .summary-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      background: #fff;
      border-radius: 1.25rem;
      padding: 1.5rem;
      border: 1px solid #edf2f7;
      box-shadow:
        0 4px 6px -1px rgba(0,0,0,0.05),
        0 2px 4px -1px rgba(0,0,0,0.03);
    }

    .summary-card span {
      display: block;
      margin-bottom: 0.75rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .summary-card strong {
      font-size: 2rem;
      font-weight: 800;
      color: #1a202c;
    }

    .total-card {
      background: linear-gradient(
        135deg,
        #3182ce,
        #2b6cb0
      );
      color: #fff;
    }

    .total-card span {
      color: rgba(255,255,255,0.85);
    }

    .total-card strong {
      color: #fff;
      font-size: 2.7rem;
    }

    /* ===== SECTIONS ===== */

    .add-item-card,
    .items-section,
    .close-order-section {
      background: #fff;
      border-radius: 1.25rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid #edf2f7;
      box-shadow:
        0 4px 6px -1px rgba(0,0,0,0.05),
        0 2px 4px -1px rgba(0,0,0,0.03);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: #1a202c;
    }

    .items-total {
      font-size: 1.3rem;
      font-weight: 800;
      color: #3182ce;
    }

    /* ===== FORM ===== */

    .add-item-form {
      display: grid;
      grid-template-columns: 1fr 90px 140px;
      gap: 1rem;
      align-items: end;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #4a5568;
    }

    .form-group input,
    .discount-form select,
    .discount-form input,
    .close-order-form select {
      width: 100%;
      height: 48px;
      padding: 0 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      background: #fff;
      font-size: 16px;
      transition: all 0.2s ease;
    }

    .form-group input:focus,
    .discount-form select:focus,
    .discount-form input:focus,
    .close-order-form select:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
    }

    /* ===== AUTOCOMPLETE ===== */

    .autocomplete-container {
      position: relative;
    }

    .suggestions {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      right: 0;
      background: #fff;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      z-index: 100;
      max-height: 260px;
      overflow-y: auto;
      box-shadow:
        0 10px 15px -3px rgba(0,0,0,0.08),
        0 4px 6px -2px rgba(0,0,0,0.04);
    }

    .suggestion-item {
      width: 100%;
      border: none;
      background: #fff;
      padding: 1rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      transition: background 0.2s ease;
    }

    .suggestion-item:hover {
      background: #f7fafc;
    }

    /* ===== TABLE ===== */

    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f8fafc;
    }

    th {
      padding: 1rem;
      text-align: left;
      font-size: 0.85rem;
      font-weight: 700;
      color: #718096;
      border-bottom: 1px solid #e2e8f0;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #edf2f7;
      vertical-align: middle;
    }

    tbody tr {
      transition: background 0.2s ease;
    }

    tbody tr:hover {
      background: #f8fbff;
    }

    .item-name {
      font-weight: 700;
      color: #1a202c;
    }

    .subtotal {
      font-weight: 700;
      color: #2b6cb0;
    }

    .text-right {
      text-align: right;
    }

    .btn-icon-remove {
      width: 42px;
      height: 42px;
      border: none;
      border-radius: 0.75rem;
      background: transparent;
      color: #e53e3e;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-icon-remove:hover {
      background: #fff5f5;
    }

    /* ===== FINANCIAL ===== */

    .financial-summary {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 2px solid #edf2f7;
      display: flex;
      justify-content: space-between;
      gap: 2rem;
    }

    .discount-form {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .summary-totals {
      min-width: 280px;
      background: #f8fafc;
      border-radius: 1rem;
      padding: 1.25rem;
    }

    .summary-totals p {
      display: flex;
      justify-content: space-between;
      gap: 2rem;
      margin: 0 0 0.85rem;
      font-size: 1rem;
      color: #4a5568;
    }

    .summary-totals span {
      font-weight: 700;
    }

    .final-total {
      padding-top: 1rem;
      margin-top: 1rem !important;
      border-top: 1px solid #dbe4ee;
      font-size: 1.35rem !important;
      font-weight: 800 !important;
      color: #1a202c !important;
    }

    /* ===== CLOSE ORDER ===== */

    .close-order-form {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .close-order-form select {
      max-width: 220px;
    }

    .close-order-form .btn-success {
      flex: 1;
    }

    /* ===== MODAL ===== */

    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      padding: 1rem;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal {
      width: 100%;
      max-width: 420px;
      background: #fff;
      border-radius: 1.25rem;
      padding: 1.5rem;
      box-shadow:
        0 20px 25px -5px rgba(0,0,0,0.1),
        0 10px 10px -5px rgba(0,0,0,0.04);
    }

    .modal h2 {
      margin: 0 0 1rem;
      color: #1a202c;
    }

    .modal p {
      color: #4a5568;
      line-height: 1.5;
    }

    .modal-footer {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    /* ===== TABLET ===== */

    @media (max-width: 1024px) {

      .content {
        padding: 1.5rem;
      }

      .summary-grid {
        grid-template-columns: 1fr 1fr;
      }

      .total-card {
        grid-column: 1 / -1;
      }
    }

    /* ===== MOBILE ===== */

    @media (max-width: 768px) {

      .content {
        padding:
          5.5rem
          1rem
          1rem
          1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .page-header h1 {
        font-size: 1.7rem;
        padding-right: 3rem;
      }

      .description-edit {
        flex-direction: column;
      }

      .description-edit input {
        width: 100%;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .total-card {
        position: sticky;
        top: 5rem;
        z-index: 20;
      }

      .total-card strong {
        font-size: 2.4rem;
      }

      .add-item-form {
        grid-template-columns: 1fr;
      }

      .financial-summary {
        flex-direction: column;
      }

      .discount-form {
        flex-direction: column;
        align-items: stretch;
      }

      .close-order-form {
        flex-direction: column;
        align-items: stretch;
      }

      .close-order-form select {
        max-width: none;
      }

      .modal-footer {
        flex-direction: column-reverse;
      }

      .modal-footer button {
        width: 100%;
      }

      /* MOBILE TABLE */

      table,
      thead,
      tbody,
      th,
      td,
      tr {
        display: block;
        width: 100%;
      }

      thead {
        display: none;
      }

      tbody {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      tr {
        border: 1px solid #edf2f7;
        border-radius: 1rem;
        padding: 1rem;
      }

      td {
        border: none;
        padding: 0;
        margin-bottom: 0.6rem;
      }

      td:last-child {
        margin-bottom: 0;
      }

      .text-right {
        text-align: left;
      }

      .btn-icon-remove {
        width: 100%;
        background: #fff5f5;
      }
    }

    /* ===== SMALL MOBILE ===== */

    @media (max-width: 480px) {

      .content {
        padding:
          5.2rem
          0.75rem
          0.75rem
          0.75rem;
      }

      .page-header h1 {
        font-size: 1.5rem;
      }

      .summary-card,
      .add-item-card,
      .items-section,
      .close-order-section {
        padding: 1.1rem;
        border-radius: 1rem;
      }

      .total-card strong {
        font-size: 2rem;
      }

      .summary-totals {
        min-width: 100%;
      }
    }
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
