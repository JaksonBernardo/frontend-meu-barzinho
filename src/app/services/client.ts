import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export enum TypeClient {
  PF = 'PF',
  PJ = 'PJ'
}

export interface Client {
  id?: number;
  name: string;
  type_client?: TypeClient;
  document?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  company_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface ClientListResponse {
  items: Client[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '';

  async createClient(clientData: Client): Promise<Client> {
    try {
      return await firstValueFrom(
        this.http.post<Client>(`${this.apiUrl}/api/v1/clients/`, clientData, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao criar cliente';
    }
  }

  async listClients(limit: number = 10, offset: number = 0): Promise<ClientListResponse> {
    try {
      return await firstValueFrom(
        this.http.get<ClientListResponse>(`${this.apiUrl}/api/v1/clients/`, {
          params: { limit, offset },
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao carregar clientes';
    }
  }

  async deleteClient(clientId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}/api/v1/clients/${clientId}`, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao deletar cliente';
    }
  }

  async getClient(clientId: number): Promise<Client> {
    try {
      return await firstValueFrom(
        this.http.get<Client>(`${this.apiUrl}/api/v1/clients/${clientId}`, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao carregar cliente';
    }
  }

  async updateClient(clientId: number, clientData: Partial<Client>): Promise<Client> {
    try {
      return await firstValueFrom(
        this.http.patch<Client>(`${this.apiUrl}/api/v1/clients/${clientId}`, clientData, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao atualizar cliente';
    }
  }
}
