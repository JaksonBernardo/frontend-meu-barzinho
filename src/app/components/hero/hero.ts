import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Organização e <span>Clareza</span> para o seu Barzinho</h1>
          <p>Gerencie espetinhos, pastéis e bebidas com uma plataforma intuitiva desenhada para pequenos negócios que buscam profissionalismo.</p>
          <div class="actions">
            <button class="btn-main" routerLink="/register">Começar Agora</button>
          </div>
        </div>
        <div class="hero-image">
          <div class="card-mockup">
            <div class="mock-header"></div>
            <div class="mock-body">
              <div class="mock-line"></div>
              <div class="mock-line short"></div>
              <div class="mock-grid">
                <div class="mock-box"></div>
                <div class="mock-box"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      padding: 6rem 0;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      gap: 4rem;
    }
    .hero-content {
      flex: 1;
    }
    h1 {
      font-size: 3.5rem;
      font-weight: 800;
      color: #1a202c;
      line-height: 1.1;
      margin-bottom: 1.5rem;
    }
    h1 span {
      color: #3182ce;
    }
    p {
      font-size: 1.25rem;
      color: #4a5568;
      margin-bottom: 2.5rem;
      max-width: 540px;
    }
    .actions {
      display: flex;
      gap: 1rem;
    }
    .btn-main {
      background: #3182ce;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
    }
    .btn-outline {
      background: white;
      color: #3182ce;
      border: 2px solid #3182ce;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
    }
    .hero-image {
      flex: 1;
      display: flex;
      justify-content: center;
    }
    .card-mockup {
      width: 100%;
      max-width: 500px;
      height: 350px;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .mock-header { height: 2rem; background: #ebf8ff; border-radius: 0.5rem; width: 40%; }
    .mock-line { height: 1rem; background: #f7fafc; border-radius: 0.25rem; }
    .mock-line.short { width: 60%; }
    .mock-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
    .mock-box { height: 10rem; background: #f7fafc; border-radius: 0.5rem; }

    @media (max-width: 968px) {
      .container { flex-direction: column; text-align: center; }
      p { margin-left: auto; margin-right: auto; }
      .actions { justify-content: center; }
      h1 { font-size: 2.5rem; }
    }
  `]
})
export class HeroComponent {}
