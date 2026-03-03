import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInquiry, addComment } from '../api/inquiries';
import ErrorBanner from '../components/ErrorBanner';
import StatusBadge from '../components/StatusBadge';
import type { InquiryResponse } from '../types';
import { formatDate } from '../utils/format';

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<InquiryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getInquiry(Number(id))
      .then(setInquiry)
      .catch(() => setError('문의를 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !id) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await addComment(Number(id), comment.trim());
      setInquiry(updated);
      setComment('');
    } catch {
      setError('답변 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">로딩 중...</div>;
  }

  if (!inquiry) {
    return (
      <div className="max-w-3xl">
        <button
          onClick={() => navigate('/inquiries')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
        >
          &larr; 목록으로
        </button>
        <ErrorBanner message={error || '문의를 찾을 수 없습니다.'} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate('/inquiries')}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
      >
        &larr; 목록으로
      </button>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{inquiry.title}</h2>
          <StatusBadge status={inquiry.status} />
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <button
            onClick={() => navigate(`/users/${inquiry.userId}/inquiries`)}
            className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
          >
            {inquiry.userName || '알 수 없음'}
            <span className="text-gray-400 ml-1">#{inquiry.userId}</span>
          </button>
          <span>·</span>
          <span>{formatDate(inquiry.createdAt, true)}</span>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{inquiry.content}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          답변 ({inquiry.comments.length})
        </h3>
        {inquiry.comments.length === 0 ? (
          <p className="text-gray-500 text-sm">아직 답변이 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {inquiry.comments.map((c) => (
              <div key={c.id} className="border-l-4 border-indigo-400 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-indigo-600">{c.adminName}</span>
                  <span className="text-xs text-gray-400">
                    {formatDate(c.createdAt, true)}
                  </span>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">답변 작성</h3>
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="답변 내용을 입력하세요"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? '전송 중...' : '답변 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
