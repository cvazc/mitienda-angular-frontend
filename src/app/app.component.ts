import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'mi-tienda-app';
  currentYear = new Date().getFullYear();

  constructor(private authService: AuthService) {}

  get isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  get currentUsername(): string | null {
    return this.authService.getCurrentUsername();
  }

  logout(): void {
    this.authService.logout();
  }
}
