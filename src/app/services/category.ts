import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Category {
  id?: number;
  name: string;
  company_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryListResponse {
  items: Category[];
  total: number;
  limit: number;
  offset: number;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '';

  async createCategory(categoryData: Category): Promise<Category> {
    try {
      return await firstValueFrom(
        this.http.post<Category>(`${this.apiUrl}/api/v1/categories/`, categoryData, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao criar categoria';
    }
  }

  async listCategories(limit: number = 10, offset: number = 0, search?: string): Promise<CategoryListResponse> {
    try {
      const params: any = { limit, offset };
      if (search) params.search = search;
      return await firstValueFrom(
        this.http.get<CategoryListResponse>(`${this.apiUrl}/api/v1/categories/`, {
          params,
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao carregar categorias';
    }
  }

  async deleteCategory(categoryId: number): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}/api/v1/categories/${categoryId}`, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao deletar categoria';
    }
  }

  async getCategory(categoryId: number): Promise<Category> {
    try {
      return await firstValueFrom(
        this.http.get<Category>(`${this.apiUrl}/api/v1/categories/${categoryId}`, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao carregar categoria';
    }
  }

  async updateCategory(categoryId: number, categoryData: Partial<Category>): Promise<Category> {
    try {
      return await firstValueFrom(
        this.http.patch<Category>(`${this.apiUrl}/api/v1/categories/${categoryId}`, categoryData, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao atualizar categoria';
    }
  }
}
