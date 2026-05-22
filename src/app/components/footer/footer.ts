import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
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
            <p>Simplificando a gestão de pequenos bares e snack shops com tecnologia e clareza.</p>
          </div>
          <div class="footer-links">
            <div class="link-group">
              <h4>Produto</h4>
              <a href="#">Recursos</a>
              <a href="#">Preços</a>
              <a href="#">Demonstração</a>
            </div>
            <div class="link-group">
              <h4>Empresa</h4>
              <a href="#">Sobre</a>
              <a href="#">Contato</a>
              <a href="#">Suporte</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 Meu Barzinho. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #1a202c;
      color: #a0aec0;
      padding: 4rem 0 2rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }
    .footer-content {
      display: flex;
      justify-content: space-between;
      gap: 4rem;
      margin-bottom: 4rem;
    }
    .footer-brand {
      max-width: 300px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      margin-bottom: 1.5rem;
    }
    .icon-logo {
      width: 2rem;
      height: 2rem;
      color: #3182ce;
    }
    .footer-links {
      display: flex;
      gap: 4rem;
    }
    .link-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    h4 {
      color: white;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    a {
      color: #a0aec0;
      text-decoration: none;
      transition: color 0.2s;
    }
    a:hover {
      color: #3182ce;
    }
    .footer-bottom {
      border-top: 1px solid #2d3748;
      padding-top: 2rem;
      text-align: center;
      font-size: 0.875rem;
    }
    @media (max-width: 768px) {
      .footer-content { flex-direction: column; gap: 3rem; }
      .footer-links { gap: 2rem; }
    }
  `]
})
export class FooterComponent {}
