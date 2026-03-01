import { useEffect, useState, useCallback } from 'react';
import { sendPushNotification, getPushHistory } from '../api/admin';
import ErrorBanner from '../components/ErrorBanner';
import Pagination from '../components/Pagination';
import type { PushNotification, PageResponse, SendPushRequest } from '../types';

export default function PushNotificationPage() {
  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [targetUserIdsInput, setTargetUserIdsInput] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  // History state
  const [data, setData] = useState<PageResponse<PushNotification> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');

  const fetchHistory = useCallback(() => {
    setLoading(true);
    setHistoryError('');
    getPushHistory(page, 20)
      .then(setData)
      .catch(() => setHistoryError('발송 이력을 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  function parseUserIds(): number[] {
    return targetUserIdsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0);
  }

  function handleSendClick() {
    setFormError('');
    if (!title.trim() || !body.trim()) return;
    if (targetType === 'SPECIFIC') {
      const ids = parseUserIds();
      if (ids.length === 0) {
        setFormError('유효한 사용자 ID를 입력해주세요.');
        return;
      }
    }
    setConfirmOpen(true);
  }

  async function handleConfirmSend() {
    setConfirmOpen(false);
    setSending(true);
    setFormError('');
    setSuccessMessage('');
    try {
      const request: SendPushRequest = {
        title: title.trim(),
        body: body.trim(),
        targetType,
      };
      if (targetType === 'SPECIFIC') {
        request.targetUserIds = parseUserIds();
      }
      await sendPushNotification(request);
      setSuccessMessage('푸시 알림이 성공적으로 발송되었습니다.');
      setTitle('');
      setBody('');
      setTargetType('ALL');
      setTargetUserIdsInput('');
      setPage(0);
      fetchHistory();
    } catch {
      setFormError('푸시 알림 발송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  }

  const isFormValid = title.trim().length > 0 && body.trim().length > 0;

  const confirmTargetText =
    targetType === 'ALL'
      ? '전체 사용자'
      : `특정 사용자 (${parseUserIds().length}명)`;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">푸시 알림</h2>

      {/* Send Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">알림 발송</h3>

        {successMessage && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              className="shrink-0 text-green-400 hover:text-green-600 transition-colors"
              aria-label="닫기"
            >
              &times;
            </button>
          </div>
        )}
        <ErrorBanner message={formError} onDismiss={() => setFormError('')} />

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 50))}
              maxLength={50}
              placeholder="알림 제목을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">{title.length}/50</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              내용
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 200))}
              maxLength={200}
              rows={4}
              placeholder="알림 내용을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">{body.length}/200</p>
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              대상
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="ALL"
                  checked={targetType === 'ALL'}
                  onChange={() => setTargetType('ALL')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">전체 사용자</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="SPECIFIC"
                  checked={targetType === 'SPECIFIC'}
                  onChange={() => setTargetType('SPECIFIC')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">특정 사용자</span>
              </label>
            </div>
          </div>

          {/* Target User IDs */}
          {targetType === 'SPECIFIC' && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                사용자 ID
              </label>
              <input
                type="text"
                value={targetUserIdsInput}
                onChange={(e) => setTargetUserIdsInput(e.target.value)}
                placeholder="쉼표로 구분 (예: 1, 2, 3)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <p className="mt-1 text-xs text-gray-400">
                사용자 ID를 쉼표(,)로 구분하여 입력하세요.
              </p>
            </div>
          )}

          {/* Send Button */}
          <div className="pt-2">
            <button
              onClick={handleSendClick}
              disabled={!isFormValid || sending}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? '발송 중...' : '발송하기'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">발송 확인</h4>
            <p className="text-sm text-gray-600 mb-1">정말 발송하시겠습니까?</p>
            <p className="text-sm text-gray-500 mb-4">
              대상: <span className="font-medium text-gray-700">{confirmTargetText}</span>
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmSend}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                발송
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">발송 이력</h3>
        <ErrorBanner message={historyError} onDismiss={() => setHistoryError('')} />

        {/* Desktop table */}
        <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">발송일시</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">제목</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">내용</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">대상</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">발송수</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">실패수</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">로딩 중...</td>
                </tr>
              ) : !data || data.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">발송 이력이 없습니다.</td>
                </tr>
              ) : (
                data.content.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.body}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.targetType === 'ALL'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.targetType === 'ALL' ? '전체' : '특정'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.sentCount}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={item.failCount > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {item.failCount}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-3">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">로딩 중...</div>
          ) : !data || data.content.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">발송 이력이 없습니다.</div>
          ) : (
            data.content.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{item.title}</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.targetType === 'ALL'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.targetType === 'ALL' ? '전체' : '특정'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.body}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{new Date(item.createdAt).toLocaleString('ko-KR')}</span>
                  <span>발송 {item.sentCount}</span>
                  {item.failCount > 0 && (
                    <span className="text-red-600">실패 {item.failCount}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {data && (
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
