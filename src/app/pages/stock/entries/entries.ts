import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockService } from '../../../services/stock';
import { ItemService, Item } from '../../../services/item';
import { AuthService } from '../../../services/auth';
import { SidebarComponent } from '../../../components/sidebar/sidebar';
import { MessageModalComponent } from '../../../components/message-modal/message-modal';

@Component({
  selector: 'app-entries',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, MessageModalComponent],
  template: `
    <div class="dashboard-container">
      <app-sidebar activePage="entries"></app-sidebar>

      <main class="content">
        <header class="content-header">
          <div>
            <h1>Entradas</h1>
            <p>Registre novas entradas de mercadoria.</p>
          </div>
        </header>

        <div class="form-container">
          <form [formGroup]="entryForm" (ngSubmit)="onSubmit()">
            <div class="form-group autocomplete-container">
              <label>Produto</label>
              <input type="text" [value]="selectedItemName()" (input)="onItemSearch($event)" placeholder="Busque um produto...">
              <div class="suggestions" *ngIf="itemSuggestions().length > 0">
                <div *ngFor="let item of itemSuggestions()" (click)="selectItem(item)">
                  {{ item.name }}
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Preço</label>
              <input type="number" formControlName="price">
            </div>
            <div class="form-group">
              <label>Quantidade</label>
              <input type="number" formControlName="qtd">
            </div>
            <div class="form-group">
              <label>Data</label>
              <input type="date" formControlName="date_entry">
            </div>
            <div class="form-group">
              <label>Hora</label>
              <input type="time" formControlName="hour">
            </div>

            <button type="submit" class="btn-primary" [disabled]="entryForm.invalid || loading()">
              {{ loading() ? 'Registrando...' : 'Registrar Entrada' }}
            </button>
          </form>
        </div>
      </main>

      <app-message-modal [show]="showMessageModal()" [message]="modalMessage()" (close)="closeMessageModal()"></app-message-modal>
    </div>
  `,
  styles: [`
    .dashboard-container { display: flex; min-height: 100vh; background: #f7fafc; }
    .content { flex: 1; padding: 3rem; margin-left: 320px; }
    .content-header { margin-bottom: 2rem; }
    h1 { font-size: 2rem; font-weight: 800; color: #1a202c; margin-bottom: 0.5rem; }
    .content-header p { color: #718096; }
    .form-container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); width: 95%; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
    label { font-size: 0.875rem; font-weight: 600; color: #4a5568; }
    input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
    .btn-primary { background: #3182ce; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
    .autocomplete-container { position: relative; }
    .suggestions { 
      position: absolute; 
      top: calc(100% + 0.25rem); 
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
  `]
})
export class EntriesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stockService = inject(StockService);
  private readonly itemService = inject(ItemService);
  private readonly authService = inject(AuthService);

  entryForm: FormGroup = this.fb.group({
    item_id: [null, [Validators.required]],
    price: [null, [Validators.required]],
    qtd: [null, [Validators.required]],
    date_entry: [new Date().toISOString().split('T')[0], [Validators.required]],
    hour: [new Date().toTimeString().split(' ')[0].substring(0, 5), [Validators.required]],
    company_id: [0]
  });

  itemSuggestions = signal<Item[]>([]);
  selectedItemName = signal('');
  loading = signal(false);
  showMessageModal = signal(false);
  modalMessage = signal('');

  ngOnInit() {
    if (this.authService.user()) {
      this.entryForm.patchValue({ company_id: this.authService.user()?.company_id });
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
    this.entryForm.patchValue({ item_id: item.id, price: item.price });
    this.itemSuggestions.set([]);
  }

  async onSubmit() {
    if (this.entryForm.invalid) return;
    this.loading.set(true);
    try {
      await this.stockService.createEntry(this.entryForm.value);
      this.modalMessage.set('Entrada registrada com sucesso!');
      this.showMessageModal.set(true);
      this.entryForm.reset({ company_id: this.authService.user()?.company_id });
      this.selectedItemName.set('');
    } catch (e: any) {
      this.modalMessage.set(e?.error?.detail || 'Erro ao registrar entrada!');
      this.showMessageModal.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  closeMessageModal() {
    this.showMessageModal.set(false);
  }
}
