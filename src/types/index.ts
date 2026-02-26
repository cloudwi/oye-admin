export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalInquiries: number;
  pendingInquiries: number;
}

export interface AdminUserResponse {
  id: number;
  name: string;
  birthDate: string;
  gender: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface InquiryCommentResponse {
  id: number;
  adminName: string;
  content: string;
  createdAt: string;
}

export interface InquiryResponse {
  id: number;
  title: string;
  content: string;
  status: 'PENDING' | 'ANSWERED';
  comments: InquiryCommentResponse[];
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AppVersionConfigResponse {
  id: number;
  platform: string;
  minVersion: string;
  storeUrl: string;
  updatedAt: string;
}

export interface AppVersionUpdateRequest {
  minVersion: string;
  storeUrl: string;
}
