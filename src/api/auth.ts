import client from './client';
import type { TokenResponse } from '../types';

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID || '40b335591005b86f7a027fefb42bbb33';

export async function adminLoginKakaoCode(code: string, redirectUri: string): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/api/auth/admin/login/kakao/code', {
    code,
    redirectUri,
  });
  return data;
}

export function getKakaoLoginUrl(): string {
  const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
  return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`;
}
