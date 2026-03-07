import { useEffect, useState } from 'react';
import { getStats, generateDaily, evaluateLotto } from '../api/admin';
import ErrorBanner from '../components/ErrorBanner';
import type { AdminDashboardStats } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<'success' | 'error' | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluateResult, setEvaluateResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setError('통계를 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, []);

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

  const handleGenerateDaily = async () => {
    if (!confirm('일일 데이터를 생성하시겠습니까?')) return;
    setGenerating(true);
    setGenerateResult(null);
    try {
      await generateDaily();
      setGenerateResult('success');
    } catch {
      setGenerateResult('error');
    } finally {
      setGenerating(false);
    }
  };

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

      {/* 일일 데이터 생성 */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">일일 데이터 생성</h3>
            <p className="text-sm text-gray-500 mt-1">오늘의 운세 등 일일 데이터를 수동으로 생성합니다.</p>
          </div>
          <button
            onClick={handleGenerateDaily}
            disabled={generating}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? '생성 중...' : '생성하기'}
          </button>
        </div>
        {generateResult === 'success' && (
          <p className="mt-3 text-sm text-emerald-600 font-medium">일일 데이터가 성공적으로 생성되었습니다.</p>
        )}
        {generateResult === 'error' && (
          <p className="mt-3 text-sm text-red-600 font-medium">일일 데이터 생성에 실패했습니다.</p>
        )}
      </div>

      {/* 로또 당첨 평가 */}
      <div className="mt-4 bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">로또 당첨 평가</h3>
            <p className="text-sm text-gray-500 mt-1">미평가된 회차의 추첨 결과를 조회하고 당첨 여부를 판정합니다.</p>
          </div>
          <button
            onClick={async () => {
              if (!confirm('미평가 회차의 로또 당첨 평가를 실행하시겠습니까?')) return;
              setEvaluating(true);
              setEvaluateResult(null);
              try {
                await evaluateLotto();
                setEvaluateResult('success');
              } catch {
                setEvaluateResult('error');
              } finally {
                setEvaluating(false);
              }
            }}
            disabled={evaluating}
            className="px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {evaluating ? '평가 중...' : '평가하기'}
          </button>
        </div>
        {evaluateResult === 'success' && (
          <p className="mt-3 text-sm text-emerald-600 font-medium">로또 당첨 평가가 완료되었습니다.</p>
        )}
        {evaluateResult === 'error' && (
          <p className="mt-3 text-sm text-red-600 font-medium">로또 당첨 평가에 실패했습니다.</p>
        )}
      </div>
    </div>
  );
}
