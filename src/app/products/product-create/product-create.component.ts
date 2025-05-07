import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CrearProductoDto } from '../../models/producto.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-create',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.css',
})
export class ProductCreateComponent {
  productForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
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

  onSubmit(): void {
    this.isLoading = true;

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    const productData: CrearProductoDto = {
      name: this.productForm.value.name,
      price: parseFloat(this.productForm.value.price),
      description: this.productForm.value.description || null,
    };

    this.apiService.crearProducto(productData).subscribe({
      next: (nuevoProducto) => {
        this.isLoading = false;
        this.toastr.success(
          `Producto "${nuevoProducto.name}" creado exitosamente!`,
          'Producto Creado'
        );
        this.router.navigate(['/productos']);
      },
      error: (error) => {
        this.isLoading = false;
        let errorMsg = `Error inesperado (${error.status}). Inténtalo de nuevo.`;
        if (error.status === 400) {
          if (error.error && typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error && error.error.errors) {
            let errors = Object.values(error.error.errors).flat();
            errorMsg = errors.join(' ');
          } else {
            errorMsg = 'Error en los datos enviados. Verifica la información.';
          }
        } else if (error.status === 401 || error.status === 403) {
          errorMsg = 'No estás autorizado para crear productos.';
        } else {
          errorMsg = `Error inesperado (${error.status}). Inténtalo de nuevo más tarde.`;
        }
        this.toastr.error(errorMsg, 'Error al Crear Producto');
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
