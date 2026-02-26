import client from './client';
import type { TokenResponse } from '../types';

export async function adminLoginKakaoCode(code: string, redirectUri: string): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/api/auth/admin/login/kakao/code', {
    code,
    redirectUri,
  });
  return data;
}

export async function getKakaoLoginUrl(): Promise<string> {
  const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
  const { data } = await client.get<{ url: string }>(`/api/auth/admin/kakao?redirect_uri=${redirectUri}`);
  return data.url;
}
