export interface LoginDto {
  username: string;
  password?: string;
  email?: string;
}

export interface RegisterDto {
  username: string;
  password?: string;
  email: string | null;
}

export interface AuthResponseDto {
  token: string;
  userId?: string;
  username?: string;
  email?: string;
}
