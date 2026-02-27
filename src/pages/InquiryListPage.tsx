import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllInquiries } from '../api/inquiries';
import ErrorBanner from '../components/ErrorBanner';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import type { InquiryResponse, PageResponse } from '../types';

export default function InquiryListPage() {
  const [data, setData] = useState<PageResponse<InquiryResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    getAllInquiries(page, 20)
      .then(setData)
      .catch(() => setError('문의 목록을 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">문의 관리</h2>
      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">제목</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">작성일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">로딩 중...</td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">문의가 없습니다.</td>
              </tr>
            ) : (
              data.content.map((inquiry) => (
                <tr
                  key={inquiry.id}
                  onClick={() => navigate(`/inquiries/${inquiry.id}`)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">{inquiry.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{inquiry.title}</td>
                  <td className="px-6 py-4"><StatusBadge status={inquiry.status} /></td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">로딩 중...</div>
        ) : !data || data.content.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">문의가 없습니다.</div>
        ) : (
          data.content.map((inquiry) => (
            <div
              key={inquiry.id}
              onClick={() => navigate(`/inquiries/${inquiry.id}`)}
              className="bg-white rounded-xl shadow-sm p-4 active:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 truncate flex-1 mr-2">{inquiry.title}</span>
                <StatusBadge status={inquiry.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>#{inquiry.id}</span>
                <span>{new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {data && (
        <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
