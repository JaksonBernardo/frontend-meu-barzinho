import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.user()) {
    return true;
  }

  // Redireciona para login se não estiver autenticado
  return router.parseUrl('/login');
};
