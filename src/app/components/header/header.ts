import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="header">
      <div class="container">
        <div class="logo" routerLink="/">
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
        <nav class="nav">
          <a href="#features">Recursos</a>
          <a href="#solution">Solução</a>
          <button class="btn-primary" routerLink="/login">Acessar Plataforma</button>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: #ffffff;
      border-bottom: 1px solid #edf2f7;
      padding: 1.25rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a202c;
      cursor: pointer;
    }
    .icon-logo {
      width: 2rem;
      height: 2rem;
      color: #3182ce;
    }
    .nav {
      display: flex;
      align-items: center;
      gap: 2rem;
    }
    .nav a {
      text-decoration: none;
      color: #4a5568;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav a:hover {
      color: #3182ce;
    }
    .btn-primary {
      background: #3182ce;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary:hover {
      background: #2b6cb0;
    }
  `]
})
export class HeaderComponent {}
