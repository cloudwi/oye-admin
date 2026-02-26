import client from './client';
import type { AdminDashboardStats, AdminUserResponse, ApiResponse, PageResponse } from '../types';

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
