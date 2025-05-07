import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
} from '../../models/auth.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private authUrl = `${environment.apiUrlBase}/auth`;

  private readonly tokenKey = JWT_TOKEN_KEY;
  private readonly USERNAME_KEY = 'username';

  private authStatus = new BehaviorSubject<boolean>(this.hasToken());
  private currentUsernameBs = new BehaviorSubject<string | null>(
    this.getUsernameFromStorage()
  );

  isAuthenticated$ = this.authStatus.asObservable();
  currentUsername$ = this.currentUsernameBs.asObservable();

  registrar(registerData: RegisterDto): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/register`, registerData);
  }

  login(loginData: LoginDto): Observable<AuthResponseDto> {
    return this.http
      .post<AuthResponseDto>(`${this.authUrl}/login`, loginData)
      .pipe(
        tap((response: AuthResponseDto) => {
          if (response && response.token) {
            this.saveAuthData(response.token, response.username || null);
          } else {
            this.clearAuthData();
          }
        })
      );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getCurrentUsername(): string | null {
    return this.getUsernameFromStorage();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private getUsernameFromStorage(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  private saveAuthData(token: string, username: string | null): void {
    localStorage.setItem(this.tokenKey, token);
    if (username) {
      localStorage.setItem(this.USERNAME_KEY, username);
    } else {
      localStorage.removeItem(this.USERNAME_KEY);
    }
    this.authStatus.next(true);
    this.currentUsernameBs.next(username);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.USERNAME_KEY);
    this.authStatus.next(false);
    this.currentUsernameBs.next(null);
  }
}

export const JWT_TOKEN_KEY = 'jwt_token';
