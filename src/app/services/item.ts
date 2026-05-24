import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Item {
  id?: number;
  name: string;
  category_id: number;
  price: number;
  stock: number;
  company_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface ItemListResponse {
  items: Item[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '';

  async createItem(itemData: Item): Promise<Item> {
    try {
      return await firstValueFrom(
        this.http.post<Item>(`${this.apiUrl}/api/v1/items/`, itemData, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao criar item';
    }
  }

  async listItems(limit: number = 10, offset: number = 0, search?: string): Promise<ItemListResponse> {
    try {
      const params: any = { limit, offset };
      if (search) params.search = search;
      return await firstValueFrom(
        this.http.get<ItemListResponse>(`${this.apiUrl}/api/v1/items/`, {
          params,
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao carregar itens';
    }
  }

  async updateItem(itemId: number, itemData: Partial<Item>): Promise<Item> {
    try {
      return await firstValueFrom(
        this.http.patch<Item>(`${this.apiUrl}/api/v1/items/${itemId}`, itemData, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao atualizar item';
    }
  }

  async deleteItem(itemId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}/api/v1/items/${itemId}`, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao deletar item';
    }
  }
}
