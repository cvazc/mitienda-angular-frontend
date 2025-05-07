export interface Producto {
  id: number;
  name: string;
  price: number;
  description: string | null;
}

export interface CrearProductoDto {
  name: string;
  price: number;
  description: string | null;
}

export type ActualizarProductoDto = Partial<CrearProductoDto>;
