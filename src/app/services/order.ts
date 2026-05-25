import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Order {
  id?: number;
  number: number;
  description?: string;
  status?: 'ABERTO' | 'PAGO' | 'CANCELADO';
  type_discount?: 'FIXO' | 'PERCENTUAL';
  discount?: number;
  payment_form: 'DINHEIRO' | 'PIX' | 'DEBITO' | 'CREDITO';
  company_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '';

  async addItemToOrder(orderId: number, itemData: { item_id: number, qtd: number, price?: number }): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/api/v1/orders/${orderId}/items`, itemData, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao adicionar item à comanda';
    }
  }

  async updateOrderStatus(orderId: number, status: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.patch<any>(`${this.apiUrl}/api/v1/orders/${orderId}/status`, { status }, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao atualizar status da comanda';
    }
  }

  async removeItemFromOrder(orderId: number, orderItemId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}/api/v1/orders/${orderId}/items/${orderItemId}`, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao remover item da comanda';
    }
  }

  async getOrder(orderId: number): Promise<Order> {
    try {
      return await firstValueFrom(
        this.http.get<Order>(`${this.apiUrl}/api/v1/orders/${orderId}`, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao carregar comanda';
    }
  }

  async listOrders(): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/api/v1/orders/`, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao carregar comandas';
    }
  }

  async createOrder(orderData: Order): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/api/v1/orders/`, orderData, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao criar comanda';
    }
  }
}
