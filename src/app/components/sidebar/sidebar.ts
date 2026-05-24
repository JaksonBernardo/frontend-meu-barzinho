import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <aside class="sidebar">
      <div class="sidebar-content">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon-logo">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 8a2 2 0 0 1 2-2a2.5 2.5 0 0 1 4.8-.7A2 2 0 1 1 16 9H7Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 9h8l-1 9a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2L8 9Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 10h1a2 2 0 0 1 0 4h-1" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 12v4M13 12v4" />
          </svg>
          <span>Meu Barzinho</span>
        </div>

        <nav>
          <div class="nav-item" [class.active]="activePage === 'dashboard'" routerLink="/dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Início
          </div>

          <div class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
            Comandas
          </div>

          <div class="nav-item" [class.active]="activePage === 'clients'" routerLink="/clients">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            Clientes
          </div>

          <div class="nav-item" [class.active]="activePage === 'items'" routerLink="/items">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
            Produtos
          </div>

          <div class="nav-item" [class.active]="activePage === 'categories'" routerLink="/categories">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 0 0 3.182 0l4.318-4.318a2.25 2.25 0 0 0 0-3.182L11.159 3.659A2.25 2.25 0 0 0 9.568 3Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
            </svg>
            Categorias
          </div>

          <div class="nav-group">
            <div class="nav-item" (click)="toggleEstoque()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-11.25 0v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18v18H3V3Z" />
              </svg>
              Estoque

              <svg
                class="chevron"
                [class.open]="estoqueOpen()"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            <div class="nav-sub-items" *ngIf="estoqueOpen()">
              <div class="nav-sub-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Entradas
              </div>

              <div class="nav-sub-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                </svg>
                Saídas
              </div>
            </div>
          </div>

          <div class="nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            Relatórios
          </div>
        </nav>
      </div>

      <div class="sidebar-footer">
        <button class="btn-logout" (click)="onLogout()">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          Sair
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 92%;

      background: white;
      border-right: 1px solid #e2e8f0;

      padding: 2rem 1.5rem;

      display: flex;
      flex-direction: column;

      position: fixed;
      top: 0;
      left: 0;

      overflow: hidden;
      z-index: 1000;
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      min-height: 0;

      padding-right: 0.25rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      font-size: 1.25rem;
      font-weight: 700;
      color: #1a202c;

      margin-bottom: 3rem;
      padding-left: 0.5rem;
    }

    .icon-logo {
      width: 2rem;
      height: 2rem;
      color: #3182ce;
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 0.10rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      padding: 0.75rem 1rem;

      border-radius: 0.5rem;

      color: #4a5568;
      font-weight: 500;

      cursor: pointer;
      transition: all 0.2s ease;
    }

    .nav-item svg:not(.chevron) {
      width: 1.25rem;
      height: 1.25rem;
      opacity: 0.7;
    }

    .nav-item:hover,
    .nav-item.active {
      background: #ebf8ff;
      color: #3182ce;
    }

    .nav-item.active svg {
      opacity: 1;
    }

    .chevron {
      width: 1rem;
      height: 1rem;

      margin-left: auto;

      transition: transform 0.2s ease;
    }

    .chevron.open {
      transform: rotate(180deg);
    }

    .nav-sub-items {
      padding-left: 1rem;

      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      margin-top: 0.25rem;
    }

    .nav-sub-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      padding: 0.6rem 1rem;

      border-radius: 0.5rem;

      color: #718096;
      font-size: 0.9rem;
      font-weight: 500;

      cursor: pointer;
      transition: background 0.2s ease;
    }

    .nav-sub-item:hover {
      background: #f7fafc;
    }

    .nav-sub-item svg {
      width: 1.1rem;
      height: 1.1rem;
    }

    .sidebar-footer {
      flex-shrink: 0;

      padding-top: 1.5rem;

      margin-top: 2.0rem;
      border-top: 1px solid #e2e8f0;

      background: white;
    }

    .btn-logout {
      width: 100%;

      display: flex;
      align-items: center;
      gap: 0.75rem;

      padding: 0.75rem 1rem;

      border: none;
      border-radius: 0.5rem;

      background: none;

      color: #e53e3e;
      font-weight: 600;

      cursor: pointer;

      transition: background 0.2s ease;
    }

    .btn-logout:hover {
      background: #fff5f5;
    }

    .btn-logout svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .sidebar-content::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar-content::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 999px;
    }

    .sidebar-content::-webkit-scrollbar-track {
      background: transparent;
    }
  `]
})
export class SidebarComponent {
  @Input() activePage: string = '';

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  estoqueOpen = signal(false);

  toggleEstoque() {
    this.estoqueOpen.update(v => !v);
  }

  async onLogout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}