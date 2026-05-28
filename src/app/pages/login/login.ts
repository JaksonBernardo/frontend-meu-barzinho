import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <header class="login-header">
          <a routerLink="/" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon-back">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Voltar para Início
          </a>
          <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon-logo">
              <!-- Espuma -->
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 8a2 2 0 0 1 2-2a2.5 2.5 0 0 1 4.8-.7A2 2 0 1 1 16 9H7Z" />
              <!-- Copo -->
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 9h8l-1 9a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2L8 9Z" />
              <!-- Alça -->
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 10h1a2 2 0 0 1 0 4h-1" />
              <!-- Detalhes -->
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 12v4M13 12v4" />
            </svg>
            <span>Meu Barzinho</span>
          </div>
          <h1>Bem-vindo de volta</h1>
          <p>Acesse sua conta para gerenciar seu negócio com clareza.</p>
        </header>

        @if (errorMessage()) {
          <div class="error-alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon-error">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {{ errorMessage() }}
          </div>
        }

        <form class="login-form" (submit)="onSubmit($event)">
          <div class="form-group">
            <label for="email">E-mail</label>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="input-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              <input 
                type="email" 
                id="email" 
                name="email"
                [(ngModel)]="email"
                placeholder="seu@email.com" 
                required>
            </div>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="password">Senha</label>
              <a href="#" class="forgot-link">Esqueceu a senha?</a>
            </div>
            <div class="input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="input-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <input 
                type="password" 
                id="password" 
                name="password"
                [(ngModel)]="password"
                placeholder="••••••••" 
                required>
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading()">
            @if (isLoading()) {
              Entrando...
            } @else {
              Entrar na Plataforma
            }
          </button>
        </form>

        <footer class="card-footer">
          <p>Ainda não tem uma conta? <a routerLink="/register">Cadastre seu barzinho</a></p>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      padding: 1.5rem;
    }
    .login-card {
      width: 100%;
      max-width: 450px;
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
      padding: 3rem;
    }
    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
      position: relative;
    }
    .back-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #718096;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      position: absolute;
      top: -1.5rem;
      left: 0;
      transition: color 0.2s;
    }
    .back-link:hover {
      color: #3182ce;
    }
    .icon-back {
      width: 1rem;
      height: 1rem;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 1.5rem;
    }
    .icon-logo {
      width: 2rem;
      height: 2rem;
      color: #3182ce;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }
    p {
      color: #718096;
      font-size: 0.95rem;
    }
    .error-alert {
      background: #fff5f5;
      color: #c53030;
      padding: 1rem;
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid #feb2b2;
    }
    .icon-error {
      width: 1.25rem;
      height: 1.25rem;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #4a5568;
    }
    .forgot-link {
      font-size: 0.875rem;
      color: #3182ce;
      text-decoration: none;
      font-weight: 500;
    }
    .input-wrapper {
      position: relative;
    }
    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1.25rem;
      height: 1.25rem;
      color: #a0aec0;
    }
    input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      font-size: 1rem;
      color: #1a202c;
      transition: all 0.2s;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }
    .btn-submit {
      background: #3182ce;
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 0.5rem;
    }
    .btn-submit:hover {
      background: #2b6cb0;
    }
    .btn-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .card-footer {
      margin-top: 2.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: #718096;
    }
    .card-footer a {
      color: #3182ce;
      text-decoration: none;
      font-weight: 600;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 2rem;
      }
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  async onSubmit(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.login({
        email: this.email,
        password: this.password
      });
      this.router.navigate(['/orders']);
    } catch (error: any) {
      this.errorMessage.set(error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
