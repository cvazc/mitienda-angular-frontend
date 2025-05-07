import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { authGuard } from './core/guards/auth.guard';
import { ProductCreateComponent } from './products/product-create/product-create.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { ProductEditComponent } from './products/product-edit/product-edit.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },
  {
    path: 'productos',
    component: ProductListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'productos/crear',
    component: ProductCreateComponent,
    canActivate: [authGuard],
  },
  {
    path: 'productos/:id',
    component: ProductDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'productos/editar/:id',
    component: ProductEditComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
