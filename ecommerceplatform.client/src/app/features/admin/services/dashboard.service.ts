import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IDashboardStats } from '../interfaces/dashboard-stats.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/Dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<IDashboardStats> {
    return this.http.get<IDashboardStats>(`${this.apiUrl}/stats`);
  }
}
