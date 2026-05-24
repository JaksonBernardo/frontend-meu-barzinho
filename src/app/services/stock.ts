import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface StockOperation {
  item_id: number;
  price: number;
  qtd: number;
  date_entry?: string; // used for entry
  date_exit?: string; // used for exit
  hour: string;
  company_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '';

  async createEntry(data: StockOperation): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/api/v1/stock/entries/`, data, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao registrar entrada';
    }
  }

  async createExit(data: StockOperation): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/api/v1/stock/exits/`, data, {
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao registrar saída';
    }
  }

  async getStockReport(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      return await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/api/v1/stock/report/`, {
          params,
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao carregar relatório';
    }
  }
}
