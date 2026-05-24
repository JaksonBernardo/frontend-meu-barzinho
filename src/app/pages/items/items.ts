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
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SidebarComponent],
  template: `
    <div class="dashboard-container">
      <app-sidebar activePage="items"></app-sidebar>

      <main class="content">
        <header class="content-header">
          <div>
            <h1>Produtos</h1>
            <p>Gerencie os produtos do seu barzinho.</p>
          </div>
          <div style="display: flex; gap: 1rem;">
            <input type="text" placeholder="Pesquisar produto..." (input)="onSearch($event)" style="padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
            <button class="btn-primary" (click)="openModal()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Novo Produto
            </button>
          </div>
        </header>

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
    .dashboard-container { display: flex; min-height: 100vh; background: #f7fafc; }
    .content { flex: 1; padding: 3rem; margin-left: 320px; }
    .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { font-size: 2rem; font-weight: 800; color: #1a202c; margin-bottom: 0.5rem; }
    .content-header p { color: #718096; }

    .btn-primary { background: #3182ce; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: background 0.2s; }
    .btn-primary:hover { background: #2b6cb0; }
    .btn-primary:disabled { background: #a0aec0; cursor: not-allowed; }
    .btn-secondary { background: #edf2f7; color: #4a5568; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
    
    .table-container { background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f7fafc; padding: 1rem; text-align: left; font-size: 0.875rem; color: #718096; border-bottom: 1px solid #e2e8f0; }
    td { padding: 1rem; border-bottom: 1px solid #e2e8f0; color: #1a202c; }
    .btn-icon { background: none; border: none; color: #718096; cursor: pointer; padding: 0.25rem; }
    .btn-icon:hover { color: #3182ce; }
    .btn-icon svg { width: 1.25rem; height: 1.25rem; }
    .empty-state { padding: 3rem; text-align: center; color: #718096; }

    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 1rem; width: 500px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
    .modal header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .btn-close { background: none; border: none; color: #a0aec0; cursor: pointer; }
    .btn-close svg { width: 1.5rem; height: 1.5rem; }

    .form-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group.full-width { grid-column: span 1; }
    .form-group label { font-size: 0.875rem; font-weight: 600; color: #4a5568; }
    .form-group input, .form-group select { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 1rem; }
    .form-group input:focus { outline: none; border-color: #3182ce; ring: 2px solid #ebf8ff; }
    
    .autocomplete-container { position: relative; }
    .suggestions { 
      position: absolute; 
      top: calc(100% + 1.5rem); 
      left: 0; 
      right: 0; 
      background: white; 
      border: 1px solid #e2e8f0; 
      border-radius: 0.5rem; 
      z-index: 1001; 
      max-height: 200px; 
      overflow-y: auto; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .suggestions div { padding: 0.75rem; cursor: pointer; }
    .suggestions div:hover { background: #f7fafc; }

    .modal-footer { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; }
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
