import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SalePublic {
  order_description: string;
  order_number: number;
  item_name: string;
  item_id: number;
  qtd: number;
  item_price: number;
  total_value: number;
  payment_form: string;
  company_id: number;
  id: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '';

  async listSalesByPeriod(startDate: string, endDate: string): Promise<SalePublic[]> {
    try {
      return await firstValueFrom(
        this.http.get<SalePublic[]>(`${this.apiUrl}/api/v1/sales/period`, {
          params: { start_date: startDate, end_date: endDate },
          withCredentials: true
        })
      );
    } catch (error: any) {
      throw error.error?.detail || 'Erro ao carregar vendas por período';
    }
  }
}
