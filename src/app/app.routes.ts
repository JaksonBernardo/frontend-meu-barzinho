import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ClientsComponent } from './pages/clients/clients';
import { CategoriesComponent } from './pages/categories/categories';
import { ItemsComponent } from './pages/items/items';
import { authGuard } from './guards/auth';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard] 
  },
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
  }
];
