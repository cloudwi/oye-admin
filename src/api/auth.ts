import client from './client';
import type { TokenResponse } from '../types';

export async function adminLoginKakao(kakaoAccessToken: string): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/api/auth/admin/login/kakao', {
    accessToken: kakaoAccessToken,
  });
  return data;
}
