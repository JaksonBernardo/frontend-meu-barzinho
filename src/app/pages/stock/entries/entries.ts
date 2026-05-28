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

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .content-header h1 {
      margin: 0 0 0.5rem;
      font-size: 2rem;
      font-weight: 800;
      color: #1a202c;
      line-height: 1.2;
    }

    .content-header p {
      margin: 0;
      color: #718096;
      font-size: 0.95rem;
    }

    /* ===== FORM CONTAINER ===== */

    .form-container {
      width: 100%;
      background: #fff;
      border-radius: 1.25rem;
      padding: 2rem;
      box-shadow:
        0 10px 15px -3px rgba(0,0,0,0.06),
        0 4px 6px -2px rgba(0,0,0,0.03);
      border: 1px solid #edf2f7;
    }

    /* ===== FORM ===== */

    form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1.5rem;
    }

    /* ===== FORM GROUP ===== */

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      min-width: 0;
    }

    .form-group label {
      font-size: 0.88rem;
      font-weight: 700;
      color: #4a5568;
    }

    /* ===== INPUTS ===== */

    .form-group input {
      width: 100%;
      height: 52px;
      border: 1px solid #e2e8f0;
      border-radius: 0.9rem;
      background: #fff;
      padding: 0 1rem;
      font-size: 16px;
      color: #1a202c;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
    }

    .form-group input::placeholder {
      color: #a0aec0;
    }

    .form-group input:hover {
      border-color: #cbd5e0;
    }

    .form-group input:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 4px rgba(49, 130, 206, 0.14);
    }

    /* ===== AUTOCOMPLETE ===== */

    .autocomplete-container {
      position: relative;
      grid-column: span 2;
    }

    .suggestions {
      position: absolute;
      top: calc(100% + 0.45rem);
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      overflow: hidden;
      z-index: 1000;
      max-height: 280px;
      overflow-y: auto;
      box-shadow:
        0 10px 15px -3px rgba(0,0,0,0.08),
        0 4px 6px -2px rgba(0,0,0,0.04);
    }

    .suggestions div {
      padding: 0.95rem 1rem;
      cursor: pointer;
      transition: background 0.18s ease;
      color: #1a202c;
      font-size: 0.95rem;
      border-bottom: 1px solid #f7fafc;
    }

    .suggestions div:last-child {
      border-bottom: none;
    }

    .suggestions div:hover {
      background: #f7fafc;
    }

    /* ===== BUTTON ===== */

    .btn-primary {
      grid-column: span 2;

      height: 54px;
      border: none;
      border-radius: 1rem;

      background: #3182ce;
      color: #fff;

      font-size: 0.96rem;
      font-weight: 700;

      cursor: pointer;

      transition:
        background 0.2s ease,
        transform 0.15s ease,
        opacity 0.2s ease;
    }

    .btn-primary:hover {
      background: #2b6cb0;
    }

    .btn-primary:active {
      transform: scale(0.99);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    /* ===== DESKTOP ENHANCEMENTS ===== */

    .form-group:nth-child(2),
    .form-group:nth-child(3),
    .form-group:nth-child(4),
    .form-group:nth-child(5) {
      background: #f8fafc;
      border: 1px solid #edf2f7;
      border-radius: 1rem;
      padding: 1rem;
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

      .content-header {
        margin-top: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .content-header h1 {
        font-size: 1.6rem;
        line-height: 1.3;
        padding-right: 0.5rem;
      }

      .content-header p {
        font-size: 0.9rem;
      }

      .form-container {
        padding: 1.25rem;
        border-radius: 1rem;
      }

      form {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .autocomplete-container,
      .btn-primary {
        grid-column: span 1;
      }

      .form-group:nth-child(2),
      .form-group:nth-child(3),
      .form-group:nth-child(4),
      .form-group:nth-child(5) {
        padding: 0.85rem;
        border-radius: 0.9rem;
      }

      .form-group input {
        height: 50px;
      }

      .btn-primary {
        width: 100%;
        margin-top: 0.5rem;
      }

      .suggestions {
        max-height: 220px;
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

      .content-header h1 {
        font-size: 1.4rem;
      }

      .form-container {
        padding: 1rem;
        border-radius: 0.9rem;
      }

      .form-group input {
        font-size: 15px;
      }

      .btn-primary {
        height: 52px;
      }
    }
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
