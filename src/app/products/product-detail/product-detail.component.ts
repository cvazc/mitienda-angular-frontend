import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Producto } from '../../models/producto.interface';
import {
  Observable,
  of,
  switchMap,
  catchError,
  tap,
  map,
  finalize,
} from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  producto$: Observable<Producto | null>;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  isDeleting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private location: Location,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.producto$ = of(null);
  }

  ngOnInit(): void {
    this.loadProductDetails();
  }

  loadProductDetails(): void {
    this.isLoading = true;

    this.producto$ = this.route.paramMap.pipe(
      map((params) => params.get('id')),
      tap((id) =>
        console.log(
          `ProductDetail: Intentando cargar producto con ID string: ${id}`
        )
      ),
      switchMap((idString) => {
        if (!idString) {
          this.errorMessage = 'No se proporcionó ID de producto en la ruta.';
          this.isLoading = false;
          return of(null);
        }

        const id = +idString;

        if (isNaN(id)) {
          this.errorMessage = 'El ID de producto proporcionado no es válido.';
          this.isLoading = false;
          return of(null);
        }

        return this.apiService.getProductoById(id);
      }),
      catchError((error) => {
        let errorMsg = `Error inesperado (${error.status}) al cargar.`;

        if (error.status === 404) {
          errorMsg = 'Producto no encontrado.';
        } else if (error.status === 401 || error.status === 403) {
          errorMsg = 'No estás autorizado para ver este producto.';
        } else {
          errorMsg = `Error al cargar el producto (${error.status}). Inténtalo más tarde.`;
        }

        this.toastr.error(errorMsg, 'Error al Cargar Producto');
        this.errorMessage = errorMsg;
        this.isLoading = false;
        return of(null);
      }),
      tap((producto) => {
        if (producto) {
          this.isLoading = false;
        }
      }),
      finalize(() => {
        if (this.errorMessage && this.isLoading) {
          this.isLoading = false;
        }
      })
    );
  }

  goBack(): void {
    this.location.back();
  }

  onDelete(productId: number, productName: string): void {
    const confirmation = window.confirm(
      `¿Estás MUY seguro de que deseas eliminar el producto "${productName}" (ID: ${productId})?\n¡Esta acción no se puede deshacer!`
    );

    if (confirmation) {
      this.isDeleting = true;
      this.apiService.eliminarProducto(productId).subscribe({
        next: () => {
          this.isDeleting = false;
          this.toastr.success(
            'Se ha eliminado el producto exitosamente',
            'Producto Eliminado'
          );
          this.router.navigate(['/productos']);
        },
        error: (error) => {
          this.isDeleting = false;
          let errorMsg = `Error inesperado (${error.status}) al eliminar.`;

          if (error.status === 404) {
            errorMsg = 'Error: El producto que intentas eliminar ya no existe.';
          } else if (error.status === 401 || error.status === 403) {
            errorMsg = 'Error: No tienes permiso para eliminar este producto.';
          } else {
            errorMsg = `Error inesperado (${error.status}) al intentar eliminar. Por favor, inténtalo de nuevo.`;
          }

          this.toastr.error(errorMsg, 'Error al Eliminar Producto');
        },
      });
    } else {
      this.isDeleting = false;
    }
  }
}
