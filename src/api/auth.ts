import client from './client';
import type { TokenResponse } from '../types';

export async function adminLoginKakaoCode(code: string, redirectUri: string): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/api/auth/admin/login/kakao/code', {
    code,
    redirectUri,
  });
  return data;
}

export function getKakaoLoginUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
  return `${baseUrl}/api/auth/admin/kakao?redirect_uri=${redirectUri}`;
}
