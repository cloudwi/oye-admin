import client from './client';
import type { ApiResponse, InquiryResponse, PageResponse } from '../types';

export async function getAllInquiries(page: number, size: number): Promise<PageResponse<InquiryResponse>> {
  const { data } = await client.get<ApiResponse<PageResponse<InquiryResponse>>>('/api/inquiries/all', {
    params: { page, size },
  });
  return data.data;
}

export async function getInquiry(id: number): Promise<InquiryResponse> {
  const { data } = await client.get<InquiryResponse>(`/api/inquiries/${id}`);
  return data;
}

export async function addComment(inquiryId: number, content: string): Promise<InquiryResponse> {
  const { data } = await client.post<InquiryResponse>(`/api/inquiries/${inquiryId}/comments`, { content });
  return data;
}
