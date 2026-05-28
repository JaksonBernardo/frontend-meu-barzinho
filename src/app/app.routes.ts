import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ClientsComponent } from './pages/clients/clients';
import { CategoriesComponent } from './pages/categories/categories';
import { ItemsComponent } from './pages/items/items';
import { EntriesComponent } from './pages/stock/entries/entries';
import { ExitsComponent } from './pages/stock/exits/exits';
import { ReportComponent } from './pages/stock/report/report';
import { OrdersComponent } from './pages/orders/orders';
import { OrdersDetailComponent } from './pages/orders/detail/detail';
import { authGuard } from './guards/auth';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'clients',
    component: ClientsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'categories',
    component: CategoriesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'items',
    component: ItemsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'stock/entries',
    component: EntriesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'stock/exits',
    component: ExitsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'stock/report',
    component: ReportComponent,
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [authGuard]
  },
  {
    path: 'orders/:id',
    component: OrdersDetailComponent,
    canActivate: [authGuard]
  }
];
