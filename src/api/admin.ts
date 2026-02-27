import client from './client';
import type { AdminDashboardStats, AdminUserResponse, ApiResponse, AppVersionConfigResponse, AppVersionUpdateRequest, PageResponse, PushNotification, SendPushRequest } from '../types';

export async function getStats(): Promise<AdminDashboardStats> {
  const { data } = await client.get<AdminDashboardStats>('/api/admin/stats');
  return data;
}

export async function getUsers(page: number, size: number, search?: string): Promise<PageResponse<AdminUserResponse>> {
  const params: Record<string, string | number> = { page, size };
  if (search) params.search = search;
  const { data } = await client.get<ApiResponse<PageResponse<AdminUserResponse>>>('/api/admin/users', { params });
  return data.data;
}

export async function updateUserRole(userId: number, role: 'USER' | 'ADMIN'): Promise<AdminUserResponse> {
  const { data } = await client.patch<AdminUserResponse>(`/api/admin/users/${userId}/role`, { role });
  return data;
}

export async function getAppVersions(): Promise<AppVersionConfigResponse[]> {
  const { data } = await client.get<AppVersionConfigResponse[]>('/api/admin/app-versions');
  return data;
}

export async function updateAppVersion(platform: string, request: AppVersionUpdateRequest): Promise<AppVersionConfigResponse> {
  const { data } = await client.put<AppVersionConfigResponse>(`/api/admin/app-versions/${platform}`, request);
  return data;
}

export async function sendPushNotification(request: SendPushRequest): Promise<void> {
  await client.post('/api/admin/push', request);
}

export async function getPushHistory(page: number, size: number): Promise<PageResponse<PushNotification>> {
  const { data } = await client.get<ApiResponse<PageResponse<PushNotification>>>('/api/admin/push', { params: { page, size } });
  return data.data;
}
