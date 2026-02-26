import client from './client';
import type { TokenResponse } from '../types';

export async function adminLogin(refreshToken: string): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/api/auth/admin/login', { refreshToken });
  return data;
}
