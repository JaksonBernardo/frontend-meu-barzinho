import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ItemService, Item } from '../../services/item';
import { CategoryService, Category } from '../../services/category';
import { AuthService } from '../../services/auth';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  template: `
    <div class="dashboard-container">
      <app-sidebar activePage="items"></app-sidebar>

      <main class="content">
        <header class="content-header">
          <div class="header-title">
            <h1>Produtos</h1>
            <p>Gerencie os produtos do seu barzinho.</p>
          </div>
          <div class="header-actions">
            <input type="text" placeholder="Pesquisar produto..." (input)="onSearch($event)">
            <button class="btn-primary" (click)="openModal()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Novo Produto</span>
            </button>
          </div>
        </header>

        <div class="table-wrapper">
          <div class="table-container">
            <table *ngIf="items().length > 0; else emptyState">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th style="width: 100px;">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of items()">
                  <td>{{ item.name }}</td>
                  <td>{{ getCategoryName(item.category_id) }}</td>
                  <td>{{ item.price | currency:'BRL' }}</td>
                  <td>{{ item.stock }}</td>
                  <td>
                    <button class="btn-icon" (click)="editItem(item)">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button class="btn-icon" (click)="deleteItem(item.id!)">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="color: #e53e3e;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.12-2.212a48.625 48.625 0 0 0-6.76 0c-1.21.048-2.12 1.032-2.12 2.212v.916m7.5 0" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <ng-template #emptyState>
              <div class="empty-state">
                <p>Nenhum produto encontrado.</p>
              </div>
            </ng-template>
          </div>
        </div>
      </main>

      <!-- Modal de Confirmação de Deleção -->
      <div class="modal-overlay" *ngIf="itemToDelete()">
        <div class="modal">
          <header>
            <h2>Confirmar Exclusão</h2>
            <button class="btn-close" (click)="cancelDelete()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <p>Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.</p>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="cancelDelete()">Cancelar</button>
            <button type="button" class="btn-primary" style="background: #e53e3e;" (click)="confirmDelete()" [disabled]="loading()">
              {{ loading() ? 'Deletando...' : 'Deletar Produto' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Edição/Criação -->
      <div class="modal-overlay" *ngIf="showModal()">
        <div class="modal">
          <header>
            <h2>{{ editingItemId() ? 'Editar Produto' : 'Cadastrar Novo Produto' }}</h2>
            <button class="btn-close" (click)="closeModal()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <form [formGroup]="itemForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Nome</label>
                <input type="text" formControlName="name">
              </div>
              <div class="form-group autocomplete-container">
                <label>Categoria</label>
                <input type="text" [value]="selectedCategoryName()" (input)="onCategorySearch($event)" placeholder="Digite para buscar...">
                <div class="suggestions" *ngIf="categorySuggestions().length > 0">
                  <div *ngFor="let cat of categorySuggestions()" (click)="selectCategory(cat)">
                    {{ cat.name }}
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label>Preço</label>
                <input type="number" formControlName="price">
              </div>
              <div class="form-group" *ngIf="editingItemId()">
                <label>Estoque</label>
                <input type="number" formControlName="stock">
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="itemForm.invalid || loading()">
                {{ loading() ? 'Salvando...' : (editingItemId() ? 'Atualizar Produto' : 'Salvar Produto') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      background: #f4f7fb;
      overflow-x: hidden;
    }

    * {
      box-sizing: border-box;
    }

    .dashboard-container {
      display: flex;
      width: 100%;
      min-height: 100vh;
      background: #f4f7fb;
      overflow: hidden;
    }

    .content {
      flex: 1;
      width: 100%;
      min-width: 0;
      padding: 2rem;
      padding-left: 5.5rem; /* evita o botão da sidebar cobrir o título */
      background: #f4f7fb;
      overflow-x: hidden;
    }

    /* HEADER */

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .header-title {
      min-width: 0;
    }

    .header-title h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #1a202c;
      margin: 0 0 0.4rem;
      line-height: 1.1;
    }

    .header-title p {
      color: #718096;
      font-size: 0.95rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    .header-actions input {
      width: 260px;
      height: 44px;
      padding: 0 1rem;
      border: 1px solid #dbe3ee;
      border-radius: 0.75rem;
      background: #ffffff;
      font-size: 0.95rem;
      color: #1a202c;
      transition:
        border-color 0.2s,
        box-shadow 0.2s,
        background 0.2s;
    }

    .header-actions input::placeholder {
      color: #a0aec0;
    }

    .header-actions input:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.12);
    }

    /* BUTTONS */

    .btn-primary {
      height: 44px;
      border: none;
      border-radius: 0.75rem;
      padding: 0 1.25rem;
      background: #3182ce;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      transition:
        background 0.2s,
        transform 0.15s;
    }

    .btn-primary:hover {
      background: #2b6cb0;
    }

    .btn-primary:active {
      transform: scale(0.98);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-primary svg {
      width: 1rem;
      height: 1rem;
    }

    .btn-secondary {
      height: 42px;
      border: none;
      border-radius: 0.7rem;
      padding: 0 1rem;
      background: #edf2f7;
      color: #4a5568;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    /* TABLE */

    .table-wrapper {
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      border-radius: 1rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
      -webkit-overflow-scrolling: touch;
    }

    .table-container {
      min-width: 680px;
      background: #ffffff;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
    }

    thead {
      background: #f8fafc;
    }

    th {
      padding: 1rem 1.1rem;
      text-align: left;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: #718096;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    td {
      padding: 0.95rem 1.1rem;
      border-bottom: 1px solid #edf2f7;
      color: #1a202c;
      font-size: 0.92rem;
      vertical-align: middle;
      background: #ffffff;
    }

    tbody tr {
      transition: background 0.2s;
    }

    tbody tr:hover td {
      background: #f8fbff;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    /* PRODUCT INFO */

    .product-name {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .product-name strong {
      font-size: 0.93rem;
      font-weight: 700;
      color: #1a202c;
    }

    .product-name span {
      font-size: 0.78rem;
      color: #718096;
    }

    .category-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0.7rem;
      border-radius: 999px;
      background: #ebf8ff;
      color: #2b6cb0;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .price {
      font-weight: 700;
      color: #1a202c;
    }

    .stock-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 70px;
      padding: 0.35rem 0.7rem;
      border-radius: 999px;
      font-size: 0.76rem;
      font-weight: 700;
    }

    .stock-ok {
      background: #c6f6d5;
      color: #276749;
    }

    .stock-low {
      background: #feebc8;
      color: #c05621;
    }

    .stock-empty {
      background: #fed7d7;
      color: #c53030;
    }

    /* ACTIONS */

    .actions {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-icon {
      width: 34px;
      height: 34px;
      border: none;
      border-radius: 0.65rem;
      background: #f7fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #718096;
      cursor: pointer;
      transition:
        background 0.2s,
        color 0.2s,
        transform 0.15s;
    }

    .btn-icon:hover {
      background: #ebf8ff;
      color: #3182ce;
    }

    .btn-icon.delete:hover {
      background: #fff5f5;
      color: #e53e3e;
    }

    .btn-icon:active {
      transform: scale(0.95);
    }

    .btn-icon svg {
      width: 1rem;
      height: 1rem;
    }

    /* EMPTY */

    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      color: #718096;
      background: #ffffff;
    }

    /* MODAL */

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(3px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
    }

    .modal {
      width: 100%;
      max-width: 560px;
      background: #ffffff;
      border-radius: 1.25rem;
      padding: 2rem;
      box-shadow: 0 25px 50px rgba(15, 23, 42, 0.2);
      animation: modalShow 0.2s ease;
    }

    @keyframes modalShow {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.8rem;
    }

    .modal header h2 {
      margin: 0;
      font-size: 1.3rem;
      color: #1a202c;
    }

    .btn-close {
      width: 38px;
      height: 38px;
      border: none;
      border-radius: 0.75rem;
      background: #f7fafc;
      color: #718096;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition:
        background 0.2s,
        color 0.2s;
    }

    .btn-close:hover {
      background: #edf2f7;
      color: #1a202c;
    }

    .btn-close svg {
      width: 1.15rem;
      height: 1.15rem;
    }

    /* FORM */

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .form-group.full-width {
      grid-column: span 2;
    }

    .form-group label {
      font-size: 0.84rem;
      font-weight: 700;
      color: #4a5568;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      height: 46px;
      padding: 0 0.95rem;
      border: 1px solid #dbe3ee;
      border-radius: 0.8rem;
      background: #ffffff;
      font-size: 0.95rem;
      color: #1a202c;
      transition:
        border-color 0.2s,
        box-shadow 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.12);
    }

    /* AUTOCOMPLETE */

    .autocomplete-container {
      position: relative;
    }

    .suggestions {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.9rem;
      overflow: hidden;
      z-index: 10000;
      box-shadow: 0 15px 30px rgba(15, 23, 42, 0.12);
      max-height: 220px;
      overflow-y: auto;
    }

    .suggestions div {
      padding: 0.85rem 1rem;
      font-size: 0.92rem;
      color: #2d3748;
      cursor: pointer;
      transition: background 0.15s;
    }

    .suggestions div:hover {
      background: #f7fafc;
    }

    /* FOOTER */

    .modal-footer {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.8rem;
    }

    /* RESPONSIVE */

    @media (max-width: 992px) {
      .content {
        padding: 1.5rem;
      }

      .table-container {
        min-width: 620px;
      }
    }

    @media (max-width: 768px) {
      .content {
        padding: 1rem;
        padding-top: 5rem; /* espaço para o botão mobile */
        padding-left: 1rem;
      }

      .content-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions input {
        width: 100%;
      }

      .btn-primary {
        width: 100%;
        justify-content: center;
      }

      .table-container {
        min-width: 560px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-group.full-width {
        grid-column: span 1;
      }

      .modal {
        padding: 1.5rem;
        border-radius: 1rem;
      }

      th,
      td {
        padding: 0.85rem;
      }
    }

    @media (max-width: 480px) {
      .header-title h1 {
        font-size: 1.6rem;
      }

      .table-container {
        min-width: 520px;
      }

      .btn-icon {
        width: 32px;
        height: 32px;
      }

      .modal-footer {
        flex-direction: column-reverse;
      }

      .modal-footer button {
        width: 100%;
      }
    }
  `]
})
export class ItemsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly itemService = inject(ItemService);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  items = signal<Item[]>([]);
  allCategories = signal<Category[]>([]);
  categorySuggestions = signal<Category[]>([]);
  selectedCategoryName = signal<string>('');
  searchTerm = signal('');
  showModal = signal(false);
  itemToDelete = signal<number | null>(null);
  editingItemId = signal<number | null>(null);
  loading = signal(false);
  user = this.authService.user;

  itemForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    category_id: [null, [Validators.required]],
    price: [null, [Validators.required]],
    stock: [0],
    company_id: [0]
  });

  ngOnInit() {
    this.loadData();
    if (this.user()) {
      this.itemForm.patchValue({ company_id: this.user()?.company_id });
    }
  }

  async loadData() {
    await Promise.all([this.loadItems(), this.loadAllCategories()]);
  }

  async loadItems() {
    try {
      const response = await this.itemService.listItems(10, 0, this.searchTerm());
      this.items.set(response.items);
    } catch (error) {
      console.error(error);
    }
  }

  onSearch(event: any) {
    this.searchTerm.set(event.target.value);
    this.loadItems();
  }

  async loadAllCategories() {
    try {
      const response = await this.categoryService.listCategories(20);
      this.allCategories.set(response.items);
    } catch (error) {
      console.error(error);
    }
  }

  async onCategorySearch(event: any) {
    const term = event.target.value;
    this.selectedCategoryName.set(term);
    if (term.length > 0) {
      try {
        const response = await this.categoryService.listCategories(20, 0, term);
        this.categorySuggestions.set(response.items);
      } catch (error) {
        console.error(error);
      }
    } else {
      this.categorySuggestions.set([]);
      this.itemForm.patchValue({ category_id: null });
    }
  }

  selectCategory(category: Category) {
    this.selectedCategoryName.set(category.name);
    this.itemForm.patchValue({ category_id: category.id });
    this.categorySuggestions.set([]);
  }

  getCategoryName(id: number): string {
    const category = this.allCategories().find(c => c.id === id);
    return category ? category.name : 'Desconhecida';
  }

  openModal(item?: Item) {
    this.showModal.set(true);
    if (item) {
      this.editingItemId.set(item.id || null);
      this.itemForm.patchValue(item);
      const cat = this.allCategories().find(c => c.id === item.category_id);
      this.selectedCategoryName.set(cat ? cat.name : '');
    } else {
      this.editingItemId.set(null);
      this.selectedCategoryName.set('');
      this.itemForm.reset({ company_id: this.user()?.company_id, stock: 0 });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedCategoryName.set('');
    this.itemForm.reset({ company_id: this.user()?.company_id, stock: 0 });
  }

  async onSubmit() {
    if (this.itemForm.invalid) return;
    this.loading.set(true);
    try {
      if (this.editingItemId()) {
         await this.itemService.updateItem(this.editingItemId()!, this.itemForm.value);
      } else {
         await this.itemService.createItem(this.itemForm.value);
      }
      await this.loadItems();
      this.closeModal();
    } finally {
      this.loading.set(false);
    }
  }

  deleteItem(itemId: number) { this.itemToDelete.set(itemId); }
  cancelDelete() { this.itemToDelete.set(null); }
  editItem(item: Item) { this.openModal(item); }

  async confirmDelete() {
    const itemId = this.itemToDelete();
    if (!itemId) return;
    this.loading.set(true);
    try {
      await this.itemService.deleteItem(itemId);
      await this.loadItems();
      this.cancelDelete();
    } finally {
      this.loading.set(false);
    }
  }

  async onLogout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
