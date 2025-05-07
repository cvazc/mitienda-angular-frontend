import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RegisterDto } from '../../models/auth.interface';
import { passwordMatchValidator } from '../../validators/password-match.validator';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: passwordMatchValidator,
      }
    );
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = true;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    const registerData: RegisterDto = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.authService.registrar(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage =
          '¡Registro completado con éxito! Ahora puedes iniciar sesión.';
        this.registerForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 400) {
          if (error.error && typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else if (error.error && error.error.errors) {
            let errors = Object.values(error.error.errors).flat();
            this.errorMessage = errors.join(' ');
          } else {
            this.errorMessage =
              'Error en los datos enviados. Verifica la información (posiblemente el usuario o email ya existe).';
          }
        } else {
          this.errorMessage = `Error inesperado (${error.status}). Inténtalo de nuevo más tarde.`;
        }
      },
    });
  }

  get username() {
    return this.registerForm.get('username');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
