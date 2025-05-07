import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css'],
})
export class ProductEditComponent implements OnInit {
  productForm: FormGroup;
  productId: number | null = null;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  errorMessage: string | null = null;
  private productSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      price: [
        null,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadProductData();
  }

  ngOnDestroy(): void {
    this.productSubscription?.unsubscribe();
  }

  loadProductData(): void {
    this.isLoading = true;
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.errorMessage = 'No se encontró ID de producto en la ruta.';
      this.isLoading = false;
      return;
    }

    const id = +idParam;
    if (isNaN(id)) {
      this.errorMessage = 'El ID de producto no es válido.';
      this.isLoading = false;
      return;
    }

    this.productId = id;

    this.productSubscription = this.apiService
      .getProductoById(this.productId)
      .subscribe({
        next: (producto) => {
          if (producto) {
            this.productForm.patchValue({
              name: producto.name,
              price: producto.price,
              description: producto.description || '',
            });
          } else {
            this.errorMessage =
              'No se encontraron datos para el producto solicitado.';
          }
          this.isLoading = false;
        },
        error: (error) => {
          let errorMsg = `Error inesperado (${error.status}) al modificar.`;

          if (error.status === 404) {
            errorMsg = 'Producto no encontrado. No se puede editar.';
          } else if (error.status === 401 || error.status === 403) {
            errorMsg = 'No tienes permiso para editar este producto.';
          } else {
            errorMsg = `Error (${error.status}) al cargar datos. Intenta de nuevo.`;
          }

          this.toastr.error(errorMsg, 'Error al Modificar Producto');
          this.errorMessage = errorMsg;
          this.isLoading = false;
        },
      });
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (this.productId === null) {
      this.errorMessage =
        'Error: No se pudo determinar el ID del producto a actualizar.';
      return;
    }

    this.isSubmitting = true;

    const productData = {
      id: this.productId,
      name: this.productForm.value.name,
      price: parseFloat(this.productForm.value.price),
      description: this.productForm.value.description || null,
    };

    this.apiService.actualizarProducto(this.productId!, productData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastr.success(
          'Producto Modificado correctamente',
          'Producto Modificado'
        );
        this.router.navigate(['/productos', this.productId]);
      },
      error: (error) => {
        let errorMsg = `Error inesperado (${error.status}) al modificar.`;
        this.isSubmitting = false;

        if (error.status === 400) {
          if (error.error && typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error && error.error.errors) {
            let errors = Object.values(error.error.errors).flat();
            errorMsg = errors.join(' ');
          } else {
            errorMsg = 'Error en los datos enviados.';
          }
        } else if (error.status === 401 || error.status === 403) {
          errorMsg = 'No autorizado para actualizar.';
        } else if (error.status === 404) {
          errorMsg =
            'Producto no encontrado en el servidor al intentar actualizar.';
        } else {
          errorMsg = `Error inesperado (${error.status}). Inténtalo de nuevo.`;
        }

        this.toastr.error(errorMsg, 'Error al Modificar Producto');
        this.errorMessage = errorMsg;
      },
    });
  }

  get name() {
    return this.productForm.get('name');
  }

  get price() {
    return this.productForm.get('price');
  }

  get description() {
    return this.productForm.get('description');
  }
}
