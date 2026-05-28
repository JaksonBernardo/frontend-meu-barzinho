import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h1>Cadastro de Empresa</h1>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <!-- Admin User -->
          <div formGroupName="admin_user">
            <h3>Dados do Administrador</h3>
            <div class="form-group">
              <label>Nome</label>
              <input type="text" formControlName="name" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" formControlName="email" required>
            </div>
            <div class="form-group">
              <label>Senha</label>
              <input type="password" formControlName="password" required>
            </div>
          </div>
          
          <h3>Dados da Empresa</h3>
          <div class="form-group">
            <label>Nome da Empresa</label>
            <input type="text" formControlName="name" required>
          </div>
          <div class="form-group">
            <label>Documento (CPF/CNPJ)</label>
            <input type="text" formControlName="document" required>
          </div>
          <div class="form-group">
            <label>Endereço</label>
            <input type="text" formControlName="address" required>
          </div>

          <button type="submit" [disabled]="loading()">{{ loading() ? 'Cadastrando...' : 'Cadastrar' }}</button>
          <div *ngIf="errorMessage()" class="error">{{ errorMessage() }}</div>
        </form>
        <a routerLink="/login">Já tem conta? Login</a>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f7fafc;
      padding: 2rem;
    }
    .register-card {
      background: white;
      padding: 2.5rem;
      border-radius: 1.5rem;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
    }
    h1 { font-size: 1.75rem; color: #1a202c; margin-bottom: 1.5rem; text-align: center; }
    h3 { font-size: 1.1rem; color: #4a5568; margin: 1.5rem 0 1rem; border-bottom: 2px solid #edf2f7; padding-bottom: 0.5rem; }
    .form-group { margin-bottom: 1.25rem; }
    label { display: block; font-size: 0.875rem; font-weight: 600; color: #4a5568; margin-bottom: 0.4rem; }
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: all 0.2s;
    }
    input:focus { outline: none; border-color: #3182ce; box-shadow: 0 0 0 3px rgba(49,130,206,0.15); }
    button {
      width: 100%;
      padding: 0.85rem;
      background: #3182ce;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 1rem;
      transition: background 0.2s;
    }
    button:hover:not(:disabled) { background: #2b6cb0; }
    button:disabled { background: #a0aec0; cursor: not-allowed; }
    .error { color: #e53e3e; margin-top: 1rem; font-size: 0.875rem; text-align: center; }
    a { display: block; text-align: center; margin-top: 1.5rem; color: #718096; text-decoration: none; font-size: 0.9rem; }
    a:hover { color: #3182ce; }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  loading = signal(false);
  errorMessage = signal('');

  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    document: ['', Validators.required],
    type_doc: ['PF'],
    address: ['', Validators.required],
    plan_id: [0],
    customer_id: [''],
    admin_user: this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
  });

  async onSubmit() {
    if (this.registerForm.invalid) return;
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.post('/api/v1/companies/', this.registerForm.value));
      this.router.navigate(['/login']);
    } catch (e: any) {
      this.errorMessage.set(e.error?.detail || 'Erro ao cadastrar empresa');
    } finally {
      this.loading.set(false);
    }
  }
}
