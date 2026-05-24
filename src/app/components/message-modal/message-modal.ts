import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="show">
      <div class="modal">
        <header>
          <h2>Mensagem</h2>
          <button class="btn-close" (click)="close.emit()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <p>{{ message }}</p>
        <div class="modal-footer">
          <button type="button" class="btn-primary" (click)="close.emit()">Ok</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal { background: white; border-radius: 1rem; width: 400px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
    .modal header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .btn-close { background: none; border: none; color: #a0aec0; cursor: pointer; }
    .btn-close svg { width: 1.5rem; height: 1.5rem; }
    .modal-footer { margin-top: 1.5rem; display: flex; justify-content: flex-end; }
    .btn-primary { background: #3182ce; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
  `]
})
export class MessageModalComponent {
  @Input() show = false;
  @Input() message = '';
  @Output() close = new EventEmitter<void>();
}
