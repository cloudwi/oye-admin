import client from './client';
import type { ApiResponse, InquiryResponse, PageResponse } from '../types';

export async function getAllInquiries(page: number, size: number): Promise<PageResponse<InquiryResponse>> {
  const { data } = await client.get<ApiResponse<PageResponse<InquiryResponse>>>('/api/v1/inquiries/all', {
    params: { page, size },
  });
  return data.data;
}

export async function getInquiry(id: number): Promise<InquiryResponse> {
  const { data } = await client.get<InquiryResponse>(`/api/v1/inquiries/${id}`);
  return data;
}

export async function addComment(inquiryId: number, content: string): Promise<InquiryResponse> {
  const { data } = await client.post<InquiryResponse>(`/api/v1/inquiries/${inquiryId}/comments`, { content });
  return data;
}

export async function getUserInquiries(userId: number, page: number, size: number): Promise<PageResponse<InquiryResponse>> {
  const { data } = await client.get<ApiResponse<PageResponse<InquiryResponse>>>(`/api/v1/inquiries/user/${userId}`, {
    params: { page, size },
  });
  return data.data;
}
