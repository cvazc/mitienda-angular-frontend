import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Producto } from '../../models/producto.interface';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  productos$: Observable<Producto[]>;
  errorMessage: string | null = null;
  isLoading: boolean = true;

  constructor(private apiService: ApiService) {
    this.productos$ = of([]);
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.productos$ = this.apiService.getProductos().pipe(
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          this.errorMessage =
            'No estás autorizado para ver los productos. Intenta iniciar sesión de nuevo.';
        } else {
          this.errorMessage = `Error al cargar los productos (${error.status}). Inténtalo más tarde.`;
        }
        this.isLoading = false;
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    );
  }
}
