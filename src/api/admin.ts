import client from './client';
import type {
  AdminCompatibilityResponse,
  AdminConnectionResponse,
  AdminDashboardStats,
  AdminFortuneResponse,
  AdminGroupResponse,
  AdminLottoResponse,
  AdminUserDetailResponse,
  AdminUserResponse,
  ApiResponse,
  AppVersionConfigResponse,
  AppVersionUpdateRequest,
  LoginHistoryResponse,
  PageResponse,
  PushNotification,
  SendPushRequest,
} from '../types';

export async function getStats(): Promise<AdminDashboardStats> {
  const { data } = await client.get<AdminDashboardStats>('/api/v1/admin/stats');
  return data;
}

export async function getUsers(page: number, size: number, search?: string): Promise<PageResponse<AdminUserResponse>> {
  const params: Record<string, string | number> = { page, size };
  if (search) params.search = search;
  const { data } = await client.get<ApiResponse<PageResponse<AdminUserResponse>>>('/api/v1/admin/users', { params });
  return data.data;
}

export async function updateUserRole(userId: number, role: 'USER' | 'ADMIN'): Promise<AdminUserResponse> {
  const { data } = await client.patch<AdminUserResponse>(`/api/v1/admin/users/${userId}/role`, { role });
  return data;
}

export async function getAppVersions(): Promise<AppVersionConfigResponse[]> {
  const { data } = await client.get<AppVersionConfigResponse[]>('/api/v1/admin/app-versions');
  return data;
}

export async function updateAppVersion(platform: string, request: AppVersionUpdateRequest): Promise<AppVersionConfigResponse> {
  const { data } = await client.put<AppVersionConfigResponse>(`/api/v1/admin/app-versions/${platform}`, request);
  return data;
}

export async function sendPushNotification(request: SendPushRequest): Promise<void> {
  await client.post('/api/v1/admin/push', request);
}

export async function getPushHistory(page: number, size: number): Promise<PageResponse<PushNotification>> {
  const { data } = await client.get<ApiResponse<PageResponse<PushNotification>>>('/api/v1/admin/push', { params: { page, size } });
  return data.data;
}

export async function getUserDetail(userId: number): Promise<AdminUserDetailResponse> {
  const { data } = await client.get<AdminUserDetailResponse>(`/api/v1/admin/users/${userId}`);
  return data;
}

export async function getUserLoginHistory(userId: number, page: number, size: number): Promise<PageResponse<LoginHistoryResponse>> {
  const { data } = await client.get<ApiResponse<PageResponse<LoginHistoryResponse>>>(`/api/v1/admin/users/${userId}/login-history`, { params: { page, size } });
  return data.data;
}

export async function getUserFortunes(userId: number, page: number, size: number): Promise<PageResponse<AdminFortuneResponse>> {
  const { data } = await client.get<ApiResponse<PageResponse<AdminFortuneResponse>>>(`/api/v1/admin/users/${userId}/fortunes`, { params: { page, size } });
  return data.data;
}

export async function getUserCompatibilities(userId: number, page: number, size: number): Promise<PageResponse<AdminCompatibilityResponse>> {
  const { data } = await client.get<ApiResponse<PageResponse<AdminCompatibilityResponse>>>(`/api/v1/admin/users/${userId}/compatibilities`, { params: { page, size } });
  return data.data;
}

export async function getUserLotto(userId: number, page: number, size: number): Promise<PageResponse<AdminLottoResponse>> {
  const { data } = await client.get<ApiResponse<PageResponse<AdminLottoResponse>>>(`/api/v1/admin/users/${userId}/lotto`, { params: { page, size } });
  return data.data;
}

export async function getUserConnections(userId: number): Promise<AdminConnectionResponse[]> {
  const { data } = await client.get<AdminConnectionResponse[]>(`/api/v1/admin/users/${userId}/connections`);
  return data;
}

export async function getUserGroups(userId: number): Promise<AdminGroupResponse[]> {
  const { data } = await client.get<AdminGroupResponse[]>(`/api/v1/admin/users/${userId}/groups`);
  return data;
}

export async function generateDaily(): Promise<void> {
  await client.post('/api/v1/admin/generate-daily');
}
