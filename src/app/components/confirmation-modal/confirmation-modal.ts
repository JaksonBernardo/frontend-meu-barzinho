import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="show">
      <div class="modal">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="cancel.emit()">Cancelar</button>
          <button class="btn-danger" (click)="confirm.emit()">Confirmar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 3000; }
    .modal { background: white; border-radius: 1rem; width: 400px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
    h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: #1a202c; }
    p { color: #4a5568; margin-bottom: 2rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; }
    .btn-secondary { background: #edf2f7; color: #4a5568; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
    .btn-danger { background: #e53e3e; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
  `]
})
export class ConfirmationModalComponent {
  @Input() show = false;
  @Input() title = 'Confirmar Ação';
  @Input() message = 'Tem certeza que deseja continuar?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
