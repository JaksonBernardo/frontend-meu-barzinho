import { Component } from '@angular/core';

@Component({
  selector: 'app-features',
  standalone: true,
  template: `
    <section id="features" class="features">
      <div class="container">
        <div class="section-header">
          <h2>Tudo o que seu negócio precisa</h2>
          <p>Uma solução completa para simplificar sua rotina e focar no que importa: atender bem.</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
              </svg>
            </div>
            <h3>Controle de Estoque</h3>
            <p>Gerenciamento inteligente de espetinhos, sabores de pastéis e grade de bebidas em tempo real.</p>
          </div>
          <div class="feature-card">
            <div class="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
            </div>
            <h3>Vendas Simplificadas</h3>
            <p>Registre pedidos com agilidade. Suporte total para vendas rápidas no balcão ou atendimento nas mesas.</p>
          </div>
          <div class="feature-card">
            <div class="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <h3>Clareza Financeira</h3>
            <p>Relatórios automáticos de faturamento e lucro. Tenha uma visão clara da saúde do seu barzinho a qualquer momento.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .features {
      padding: 6rem 0;
      background: white;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }
    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }
    h2 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #1a202c;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.2rem;
      color: #4a5568;
      max-width: 700px;
      margin: 0 auto;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2.5rem;
    }
    .feature-card {
      padding: 2.5rem;
      background: #f7fafc;
      border-radius: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .icon-wrapper {
      width: 3.5rem;
      height: 3.5rem;
      background: #ebf8ff;
      color: #3182ce;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .icon-wrapper svg {
      width: 2rem;
      height: 2rem;
    }
    h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 1rem;
    }
    .feature-card p {
      font-size: 1rem;
      line-height: 1.6;
      color: #718096;
    }
  `]
})
export class FeaturesComponent {}
