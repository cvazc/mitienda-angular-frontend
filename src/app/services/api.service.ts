import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, CrearProductoDto } from '../models/producto.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private productsUrl = `${environment.apiUrlBase}/products`;

  constructor(private http: HttpClient) {}

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.productsUrl);
  }

  getProductoById(id: number): Observable<Producto> {
    const url = `${this.productsUrl}/${id}`;
    return this.http.get<Producto>(url);
  }

  crearProducto(productoData: CrearProductoDto): Observable<Producto> {
    return this.http.post<Producto>(this.productsUrl, productoData);
  }

  actualizarProducto(
    id: number,
    productData: Partial<Producto>
  ): Observable<void> {
    const url = `${this.productsUrl}/${id}`;
    return this.http.put<void>(url, productData);
  }

  eliminarProducto(id: number): Observable<void> {
    const url = `${this.productsUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
