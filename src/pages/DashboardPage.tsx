import { useEffect, useState } from 'react';
import { getStats } from '../api/admin';
import ErrorBanner from '../components/ErrorBanner';
import type { AdminDashboardStats } from '../types';

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const cards = [
    { label: '전체 유저', value: stats.totalUsers, color: 'bg-blue-500' },
    { label: '전체 문의', value: stats.totalInquiries, color: 'bg-emerald-500' },
    { label: '대기중 문의', value: stats.pendingInquiries, color: 'bg-amber-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">대시보드</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}
