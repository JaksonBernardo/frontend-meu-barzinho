import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  name: string;
  email: string;
  company_id: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '';

  // User signal to store session info (if needed elsewhere)
  user = signal<LoginResponse | null>(null);

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.apiUrl}/api/v1/auth/login`, credentials, {
          withCredentials: true // Crucial for HTTP-only cookies
        })
      );
      this.user.set(response);
      return response;
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao realizar login';
    }
  }

  async checkSession(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<LoginResponse>(`${this.apiUrl}/api/v1/auth/login/me`, {
          withCredentials: true
        })
      );
      this.user.set(response);
    } catch (error) {
      this.user.set(null);
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/api/v1/auth/logout`, {}, {
          withCredentials: true
        })
      );
    } catch (error) {
      console.error('Erro ao realizar logout no servidor', error);
    } finally {
      this.user.set(null);
    }
  }
}
