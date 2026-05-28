import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService, Client, TypeClient } from '../../services/client';
import { AuthService } from '../../services/auth';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent],
  template: `
    <div class="dashboard-container">
      <app-sidebar activePage="clients"></app-sidebar>

      <main class="content">
        <header class="content-header">
          <div class="header-title">
            <h1>Clientes</h1>
            <p>Gerencie os clientes do seu barzinho.</p>
          </div>
          <div class="header-actions">
            <input type="text" placeholder="Pesquisar cliente..." (input)="onSearch($event)">
            <button class="btn-primary" (click)="openModal()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Novo Cliente</span>
            </button>
          </div>
        </header>

        <div class="table-wrapper">
          <div class="table-container">
            <table *ngIf="clients().length > 0; else emptyState">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>CPF/CNPJ</th>
                  <th>E-mail</th>
                  <th>WhatsApp</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let client of clients()">
                  <td>{{ client.name }}</td>
                  <td>
                    <span class="badge" [class.badge-pf]="client.type_client === 'PF'" [class.badge-pj]="client.type_client === 'PJ'">
                      {{ client.type_client }}
                    </span>
                  </td>
                  <td>{{ client.document }}</td>
                  <td>{{ client.email }}</td>
                  <td>{{ client.whatsapp }}</td>
                  <td>
                    <button class="btn-icon" (click)="editClient(client)">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button class="btn-icon" (click)="deleteClient(client.id!)">
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
                <p>Nenhum cliente encontrado.</p>
              </div>
            </ng-template>

            <div class="pagination" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-top: 1px solid #e2e8f0; background: #f7fafc;">
              <span style="font-size: 0.875rem; color: #718096;">Total: {{ totalClients() }}</span>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn-secondary" (click)="prevPage()" [disabled]="offset() === 0">Anterior</button>
                <button class="btn-secondary" (click)="nextPage()" [disabled]="offset() + limit() >= totalClients()">Próximo</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Modal de Confirmação de Deleção -->
      <div class="modal-overlay" *ngIf="clientToDelete()">
        <div class="modal">
          <header>
            <h2>Confirmar Exclusão</h2>
            <button class="btn-close" (click)="cancelDelete()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <p>Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.</p>

          <div class="error-message" *ngIf="errorMessage()">
            {{ errorMessage() }}
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="cancelDelete()">Cancelar</button>
            <button type="button" class="btn-primary" style="background: #e53e3e;" (click)="confirmDelete()" [disabled]="loading()">
              {{ loading() ? 'Deletando...' : 'Deletar Cliente' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Criação -->
      <div class="modal-overlay" *ngIf="showModal()">
        <div class="modal">
          <header>
            <h2>{{ editingClientId() ? 'Editar Cliente' : 'Cadastrar Novo Cliente' }}</h2>
            <button class="btn-close" (click)="closeModal()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <div class="form-group">
                <label>Nome Completo</label>
                <input type="text" formControlName="name" placeholder="Ex: João da Silva">
              </div>

              <div class="form-group">
                <label>Tipo de Cliente</label>
                <select formControlName="type_client">
                  <option value="">Selecione...</option>
                  <option value="PF">Pessoa Física (PF)</option>
                  <option value="PJ">Pessoa Jurídica (PJ)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Documento (CPF/CNPJ)</label>
                <input type="text" formControlName="document" placeholder="Apenas números">
              </div>

              <div class="form-group">
                <label>E-mail</label>
                <input type="email" formControlName="email" placeholder="exemplo@email.com">
              </div>

              <div class="form-group">
                <label>WhatsApp</label>
                <input type="text" formControlName="whatsapp" placeholder="(00) 00000-0000">
              </div>

              <div class="form-group full-width">
                <label>Endereço</label>
                <input type="text" formControlName="address" placeholder="Rua, número, bairro...">
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
              <button type="submit" class="btn-primary" [disabled]="clientForm.invalid || loading()">
                {{ loading() ? 'Salvando...' : (editingClientId() ? 'Atualizar Cliente' : 'Salvar Cliente') }}
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

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .header-title {
      flex: 1;
      min-width: 0;
    }

    .header-title h1 {
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

    /* ===== ACTIONS ===== */

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .header-actions input {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
    }

    .header-actions input:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49,130,206,0.15);
    }

    /* ===== BUTTONS ===== */

    .btn-primary,
    .btn-secondary {
      min-height: 46px;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #3182ce;
      color: white;
      padding: 0 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      white-space: nowrap;
    }

    .btn-primary:hover {
      background: #2b6cb0;
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-primary svg {
      width: 18px;
      height: 18px;
    }

    .btn-secondary {
      background: #edf2f7;
      color: #4a5568;
      padding: 0 1rem;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    /* ===== TABLE ===== */

    .table-wrapper {
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      background: #ffffff;
      border-radius: 1rem;
      position: relative;

      box-shadow:
        0 4px 6px -1px rgba(0,0,0,0.08),
        0 2px 4px -1px rgba(0,0,0,0.04);

      -webkit-overflow-scrolling: touch;

      /* evita fundo aparecendo no bounce scroll */
      overscroll-behavior-x: contain;
    }

    .table-container {
      min-width: 950px;
      background: #ffffff;
    }

    table {
      width: 100%;
      min-width: 950px;
      border-collapse: collapse;
      background: #ffffff;
    }

    thead,
    tbody,
    tr,
    th,
    td {
      background: #ffffff;
    }

    thead {
      background: #f7fafc;
    }

    tbody tr:hover {
      background: #f8fbff;
    }

    tbody tr:hover td {
      background: #f8fbff;
    }

    thead {
      background: #f7fafc;
    }

    th {
      padding: 0.95rem 1rem;
      text-align: left;
      font-size: 0.82rem;
      font-weight: 700;
      color: #718096;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    td {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid #edf2f7;
      color: #1a202c;
      font-size: 0.92rem;
      vertical-align: middle;
    }

    tbody tr {
      transition: background 0.2s ease;
    }

    tbody tr:hover {
      background: #f8fbff;
    }

    /* ===== BADGES ===== */

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.3rem 0.6rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .badge-pf {
      background: #ebf8ff;
      color: #3182ce;
    }

    .badge-pj {
      background: #fefcbf;
      color: #b7791f;
    }

    /* ===== ICON BUTTONS ===== */

    .btn-icon {
      width: 34px;
      height: 34px;
      border: none;
      border-radius: 0.65rem;
      background: transparent;
      color: #718096;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
    }

    .btn-icon:hover {
      background: #edf2f7;
    }

    .btn-icon svg {
      width: 1rem;
      height: 1rem;
    }

    /* ===== EMPTY ===== */

    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      color: #718096;
    }

    /* ===== PAGINATION ===== */

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-top: 1px solid #e2e8f0;
      background: #f7fafc;
    }

    .pagination-buttons {
      display: flex;
      gap: 0.5rem;
    }

    /* ===== MODAL ===== */

    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      padding: 1rem;
      background: rgba(15,23,42,0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal {
      width: 100%;
      max-width: 650px;
      max-height: 90vh;
      overflow-y: auto;
      background: white;
      border-radius: 1.25rem;
      padding: 1.5rem;
      box-shadow:
        0 20px 25px -5px rgba(0,0,0,0.1),
        0 10px 10px -5px rgba(0,0,0,0.04);
    }

    .modal header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      gap: 1rem;
    }

    .modal h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #1a202c;
    }

    .btn-close {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 0.75rem;
      background: transparent;
      color: #718096;
      cursor: pointer;
    }

    .btn-close:hover {
      background: #edf2f7;
    }

    .btn-close svg {
      width: 20px;
      height: 20px;
    }

    /* ===== FORM ===== */

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: span 2;
    }

    .form-group label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #4a5568;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      min-height: 48px;
      padding-left: 1rem;
      padding-right: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      background: white;
      font-size: 16px;
      transition: all 0.2s ease;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49,130,206,0.15);
    }

    /* ===== MESSAGES ===== */

    .error-message {
      margin-top: 1rem;
      color: #e53e3e;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .success-message {
      margin-top: 1rem;
      color: #38a169;
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* ===== MODAL FOOTER ===== */

    .modal-footer {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      flex-wrap: wrap;
    }

    /* ===== TABLET ===== */

    @media (max-width: 1024px) {

      .content {
        padding: 1.5rem;
      }

      .content-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        width: 100%;
      }

      .header-actions input {
        padding: 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
      }

      /* Esconde email */
      th:nth-child(4),
      td:nth-child(4) {
        display: none;
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

      .content-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1.25rem;
        margin-top: 0.5rem;
      }

      .header-title h1 {
        font-size: 1.6rem;
        line-height: 1.3;
      }

      .header-actions {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
      }

      .header-actions input,
      .btn-primary {
        width: 100%;
      }

      .btn-primary {
        height: 50px;
      }

      .table-container {
        min-width: 100%;
      }

      table {
        min-width: 650px;
      }

      th,
      td {
        padding: 0.75rem;
        font-size: 0.85rem;
      }

      /* Esconde email e documento */
      th:nth-child(3),
      td:nth-child(3),
      th:nth-child(4),
      td:nth-child(4) {
        display: none;
      }

      .btn-icon {
        width: 30px;
        height: 30px;
      }

      .btn-icon svg {
        width: 0.9rem;
        height: 0.9rem;
      }

      .pagination {
        flex-direction: column;
        align-items: stretch;
      }

      .pagination-buttons {
        width: 100%;
      }

      .pagination-buttons button {
        flex: 1;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-group.full-width {
        grid-column: span 1;
      }

      .modal {
        padding: 1.25rem;
        border-radius: 1rem;
      }

      .modal-footer {
        flex-direction: column-reverse;
      }

      .modal-footer button {
        width: 100%;
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

      .header-title h1 {
        font-size: 1.4rem;
      }

      .table-wrapper {
        border-radius: 0.75rem;
      }

      th,
      td {
        padding: 0.65rem;
        font-size: 0.8rem;
      }

      .badge {
        font-size: 0.68rem;
        padding: 0.25rem 0.5rem;
      }

      .modal {
        padding: 1rem;
      }
    }
  `]
})
export class ClientsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  clients = signal<Client[]>([]);
  totalClients = signal(0);
  limit = signal(10);
  offset = signal(0);
  searchTerm = signal('');
  showModal = signal(false);
  clientToDelete = signal<number | null>(null);
  editingClientId = signal<number | null>(null);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  user = this.authService.user;

  clientForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    type_client: [''],
    document: [''],
    email: ['', [Validators.email]],
    whatsapp: [''],
    address: [''],
    company_id: [0]
  });

  ngOnInit() {
    this.loadClients();
    const currentUser = this.user();
    if (currentUser) {
      this.clientForm.patchValue({ company_id: currentUser.company_id });
    }
  }

  async loadClients() {
    try {
      const response = await this.clientService.listClients(this.limit(), this.offset(), this.searchTerm());
      this.clients.set(response.items);
      this.totalClients.set(response.total);
    } catch (error) {
      console.error('Erro ao carregar clientes', error);
    }
  }

  onSearch(event: any) {
    this.searchTerm.set(event.target.value);
    this.offset.set(0); // Reset pagination
    this.loadClients();
  }

  nextPage() {
    if (this.offset() + this.limit() < this.totalClients()) {
      this.offset.update(v => v + this.limit());
      this.loadClients();
    }
  }

  prevPage() {
    if (this.offset() >= this.limit()) {
      this.offset.update(v => v - this.limit());
      this.loadClients();
    }
  }

  openModal(client?: Client) {
    this.showModal.set(true);
    this.errorMessage.set('');
    if (client) {
      this.editingClientId.set(client.id || null);
      this.clientForm.patchValue(client);
    } else {
      this.editingClientId.set(null);
      this.clientForm.reset({ type_client: '', company_id: this.user()?.company_id });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.clientForm.reset({ type_client: '', company_id: this.user()?.company_id });
  }

  async onSubmit() {
    if (this.clientForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const formData = { ...this.clientForm.value };
    // Remove empty strings to send null to the backend
    Object.keys(formData).forEach(key => {
      if (formData[key] === '') {
        formData[key] = null;
      }
    });

    try {
      if (this.editingClientId()) {
        await this.clientService.updateClient(this.editingClientId()!, formData);
        this.successMessage.set('Cliente atualizado com sucesso!');
        setTimeout(() => this.successMessage.set(''), 3000);
      } else {
        await this.clientService.createClient(formData);
      }
      await this.loadClients();
      this.closeModal();
    } catch (error: any) {
      this.errorMessage.set(error);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteClient(clientId: number) {
    this.clientToDelete.set(clientId);
  }

  async confirmDelete() {
    const clientId = this.clientToDelete();
    if (!clientId) return;

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.clientService.deleteClient(clientId);
      await this.loadClients();
      this.cancelDelete();
    } catch (error: any) {
      this.errorMessage.set(error || 'Erro ao deletar cliente');
    } finally {
      this.loading.set(false);
    }
  }

  cancelDelete() {
    this.clientToDelete.set(null);
  }

  editClient(client: Client) {
    this.openModal(client);
  }
}
