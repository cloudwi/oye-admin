import { useEffect, useState } from 'react';
import { getStats, backfillFortuneScores } from '../api/admin';
import ErrorBanner from '../components/ErrorBanner';
import type { AdminDashboardStats } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);
  const [backfillDone, setBackfillDone] = useState(false);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setError('통계를 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const handleBackfill = async () => {
    if (!confirm('score가 없는 기존 예감 데이터를 AI로 재채점합니다. 진행할까요?')) return;

    setBackfillLoading(true);
    setBackfillResult(null);
    try {
      const result = await backfillFortuneScores();
      if (result.updated === 0) {
        setBackfillResult('채점이 필요한 데이터가 없습니다.');
      } else {
        setBackfillResult(`${result.updated}건의 예감 점수가 업데이트되었습니다.`);
      }
      setBackfillDone(true);
    } catch {
      setBackfillResult('백필 실행에 실패했습니다.');
    } finally {
      setBackfillLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">로딩 중...</div>;
  }

  if (error || !stats) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">대시보드</h2>
        <ErrorBanner message={error || '통계를 불러올 수 없습니다.'} />
      </div>
    );
  }

  const cards = [
    { label: '전체 유저', value: stats.totalUsers, color: 'bg-blue-500' },
    { label: '전체 문의', value: stats.totalInquiries, color: 'bg-emerald-500' },
    { label: '대기중 문의', value: stats.pendingInquiries, color: 'bg-amber-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">대시보드</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">
                  {card.label.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">데이터 관리</h3>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">예감 점수 백필</p>
              <p className="text-sm text-gray-500 mt-1">
                점수가 없는 기존 예감 데이터를 AI로 재채점합니다.
              </p>
            </div>
            <button
              onClick={handleBackfill}
              disabled={backfillLoading || backfillDone}
              className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {backfillLoading ? '처리 중...' : backfillDone ? '완료' : '백필 실행'}
            </button>
          </div>
          {backfillResult && (
            <p className={`mt-3 text-sm ${backfillResult.includes('실패') ? 'text-red-600' : 'text-emerald-600'}`}>
              {backfillResult}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
