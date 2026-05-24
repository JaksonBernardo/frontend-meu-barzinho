import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService, Category } from '../../services/category';
import { AuthService } from '../../services/auth';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  template: `
    <div class="dashboard-container">
      <app-sidebar activePage="categories"></app-sidebar>

      <main class="content">
        <header class="content-header">
          <div>
            <h1>Categorias</h1>
            <p>Gerencie as categorias de produtos do seu barzinho.</p>
          </div>
          <div style="display: flex; gap: 1rem;">
            <input type="text" placeholder="Pesquisar categoria..." (input)="onSearch($event)" style="padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
            <button class="btn-primary" (click)="openModal()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nova Categoria
            </button>
          </div>
        </header>

        <div class="table-container">
          <table *ngIf="categories().length > 0; else emptyState">
            <thead>
              <tr>
                <th>Nome</th>
                <th style="width: 100px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let category of categories()">
                <td>{{ category.name }}</td>
                <td>
                  <button class="btn-icon" (click)="editCategory(category)">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button class="btn-icon" (click)="deleteCategory(category.id!)">
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
              <p>Nenhuma categoria encontrada.</p>
            </div>
          </ng-template>

          <div class="pagination" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-top: 1px solid #e2e8f0; background: #f7fafc;">
            <span style="font-size: 0.875rem; color: #718096;">Total: {{ totalCategories() }}</span>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-secondary" (click)="prevPage()" [disabled]="offset() === 0">Anterior</button>
              <button class="btn-secondary" (click)="nextPage()" [disabled]="offset() + limit() >= totalCategories()">Próximo</button>
            </div>
          </div>
        </div>
      </main>

      <!-- Modal de Confirmação de Deleção -->
      <div class="modal-overlay" *ngIf="categoryToDelete()">
        <div class="modal">
          <header>
            <h2>Confirmar Exclusão</h2>
            <button class="btn-close" (click)="cancelDelete()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <p>Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.</p>

          <div class="error-message" *ngIf="errorMessage()">
            {{ errorMessage() }}
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="cancelDelete()">Cancelar</button>
            <button type="button" class="btn-primary" style="background: #e53e3e;" (click)="confirmDelete()" [disabled]="loading()">
              {{ loading() ? 'Deletando...' : 'Deletar Categoria' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Criação -->
      <div class="modal-overlay" *ngIf="showModal()">
        <div class="modal">
          <header>
            <h2>{{ editingCategoryId() ? 'Editar Categoria' : 'Cadastrar Nova Categoria' }}</h2>
            <button class="btn-close" (click)="closeModal()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Nome da Categoria</label>
                <input type="text" formControlName="name" placeholder="Ex: Bebidas, Comidas, etc.">
              </div>
            </div>

            <div class="error-message" *ngIf="errorMessage()">
              {{ errorMessage() }}
            </div>

            <div class="success-message" *ngIf="successMessage()" style="margin-top: 1rem; color: #38a169; font-size: 0.875rem; font-weight: 500;">
              {{ successMessage() }}
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="categoryForm.invalid || loading()">
                {{ loading() ? 'Salvando...' : (editingCategoryId() ? 'Atualizar Categoria' : 'Salvar Categoria') }}
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
    .form-group input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 1rem; }
    .form-group input:focus { outline: none; border-color: #3182ce; ring: 2px solid #ebf8ff; }
    
    .error-message { margin-top: 1rem; color: #e53e3e; font-size: 0.875rem; font-weight: 500; }
    .modal-footer { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; }
  `]
})
export class CategoriesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  categories = signal<Category[]>([]);
  totalCategories = signal(0);
  limit = signal(10);
  offset = signal(0);
  searchTerm = signal('');
  showModal = signal(false);
  categoryToDelete = signal<number | null>(null);
  editingCategoryId = signal<number | null>(null);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  user = this.authService.user;

  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    company_id: [0]
  });

  ngOnInit() {
    this.loadCategories();
    const currentUser = this.user();
    if (currentUser) {
      this.categoryForm.patchValue({ company_id: currentUser.company_id });
    }
  }

  async loadCategories() {
    try {
      const response = await this.categoryService.listCategories(this.limit(), this.offset(), this.searchTerm());
      this.categories.set(response.items);
      this.totalCategories.set(response.total);
    } catch (error) {
      console.error('Erro ao carregar categorias', error);
    }
  }

  onSearch(event: any) {
    this.searchTerm.set(event.target.value);
    this.offset.set(0); // Reset pagination
    this.loadCategories();
  }

  nextPage() {
    if (this.offset() + this.limit() < this.totalCategories()) {
      this.offset.update(v => v + this.limit());
      this.loadCategories();
    }
  }

  prevPage() {
    if (this.offset() >= this.limit()) {
      this.offset.update(v => v - this.limit());
      this.loadCategories();
    }
  }

  openModal(category?: Category) {
    this.showModal.set(true);
    this.errorMessage.set('');
    if (category) {
      this.editingCategoryId.set(category.id || null);
      this.categoryForm.patchValue(category);
    } else {
      this.editingCategoryId.set(null);
      this.categoryForm.reset({ company_id: this.user()?.company_id });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.categoryForm.reset({ company_id: this.user()?.company_id });
  }

  async onSubmit() {
    if (this.categoryForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const formData = { ...this.categoryForm.value };

    try {
      if (this.editingCategoryId()) {
        await this.categoryService.updateCategory(this.editingCategoryId()!, formData);
        this.successMessage.set('Categoria atualizada com sucesso!');
        setTimeout(() => this.successMessage.set(''), 3000);
      } else {
        await this.categoryService.createCategory(formData);
      }
      await this.loadCategories();
      this.closeModal();
    } catch (error: any) {
      this.errorMessage.set(error);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteCategory(categoryId: number) {
    this.categoryToDelete.set(categoryId);
  }

  async confirmDelete() {
    const categoryId = this.categoryToDelete();
    if (!categoryId) return;

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.categoryService.deleteCategory(categoryId);
      await this.loadCategories();
      this.cancelDelete();
    } catch (error: any) {
      this.errorMessage.set(error || 'Erro ao deletar categoria');
    } finally {
      this.loading.set(false);
    }
  }

  cancelDelete() {
    this.categoryToDelete.set(null);
  }

  editCategory(category: Category) {
    this.openModal(category);
  }
}
