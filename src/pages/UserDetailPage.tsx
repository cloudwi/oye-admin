import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getUserDetail,
  getUserLoginHistory,
  getUserFortunes,
  getUserCompatibilities,
  getUserLotto,
  getUserConnections,
  getUserGroups,
} from '../api/admin';
import ErrorBanner from '../components/ErrorBanner';
import Pagination from '../components/Pagination';
import type {
  AdminUserDetailResponse,
  LoginHistoryResponse,
  AdminFortuneResponse,
  AdminCompatibilityResponse,
  AdminLottoResponse,
  AdminConnectionResponse,
  AdminGroupResponse,
  PageResponse,
} from '../types';
import { formatDate } from '../utils/format';

type TabKey = 'profile' | 'login' | 'fortune' | 'compatibility' | 'lotto' | 'connection';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'profile', label: '프로필' },
  { key: 'login', label: '로그인 기록' },
  { key: 'fortune', label: '예감' },
  { key: 'compatibility', label: '궁합' },
  { key: 'lotto', label: '로또' },
  { key: 'connection', label: '연결/그룹' },
];

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [error, setError] = useState('');

  // Profile
  const [profile, setProfile] = useState<AdminUserDetailResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Login history
  const [loginData, setLoginData] = useState<PageResponse<LoginHistoryResponse> | null>(null);
  const [loginPage, setLoginPage] = useState(0);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginLoaded, setLoginLoaded] = useState(false);

  // Fortunes
  const [fortuneData, setFortuneData] = useState<PageResponse<AdminFortuneResponse> | null>(null);
  const [fortunePage, setFortunePage] = useState(0);
  const [fortuneLoading, setFortuneLoading] = useState(false);
  const [fortuneLoaded, setFortuneLoaded] = useState(false);

  // Compatibilities
  const [compatData, setCompatData] = useState<PageResponse<AdminCompatibilityResponse> | null>(null);
  const [compatPage, setCompatPage] = useState(0);
  const [compatLoading, setCompatLoading] = useState(false);
  const [compatLoaded, setCompatLoaded] = useState(false);

  // Lotto
  const [lottoData, setLottoData] = useState<PageResponse<AdminLottoResponse> | null>(null);
  const [lottoPage, setLottoPage] = useState(0);
  const [lottoLoading, setLottoLoading] = useState(false);
  const [lottoLoaded, setLottoLoaded] = useState(false);

  // Connections & Groups
  const [connections, setConnections] = useState<AdminConnectionResponse[]>([]);
  const [groups, setGroups] = useState<AdminGroupResponse[]>([]);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionLoaded, setConnectionLoaded] = useState(false);

  // Load profile on mount
  useEffect(() => {
    if (!userId) return;
    setProfileLoading(true);
    setError('');
    getUserDetail(userId)
      .then(setProfile)
      .catch(() => setError('유저 정보를 불러오는데 실패했습니다.'))
      .finally(() => setProfileLoading(false));
  }, [userId]);

  // Login history loader
  const fetchLoginHistory = useCallback(() => {
    setLoginLoading(true);
    setError('');
    getUserLoginHistory(userId, loginPage, 20)
      .then((d) => { setLoginData(d); setLoginLoaded(true); })
      .catch(() => setError('로그인 기록을 불러오는데 실패했습니다.'))
      .finally(() => setLoginLoading(false));
  }, [userId, loginPage]);

  // Fortune loader
  const fetchFortunes = useCallback(() => {
    setFortuneLoading(true);
    setError('');
    getUserFortunes(userId, fortunePage, 20)
      .then((d) => { setFortuneData(d); setFortuneLoaded(true); })
      .catch(() => setError('예감 데이터를 불러오는데 실패했습니다.'))
      .finally(() => setFortuneLoading(false));
  }, [userId, fortunePage]);

  // Compatibility loader
  const fetchCompat = useCallback(() => {
    setCompatLoading(true);
    setError('');
    getUserCompatibilities(userId, compatPage, 20)
      .then((d) => { setCompatData(d); setCompatLoaded(true); })
      .catch(() => setError('궁합 데이터를 불러오는데 실패했습니다.'))
      .finally(() => setCompatLoading(false));
  }, [userId, compatPage]);

  // Lotto loader
  const fetchLotto = useCallback(() => {
    setLottoLoading(true);
    setError('');
    getUserLotto(userId, lottoPage, 20)
      .then((d) => { setLottoData(d); setLottoLoaded(true); })
      .catch(() => setError('로또 데이터를 불러오는데 실패했습니다.'))
      .finally(() => setLottoLoading(false));
  }, [userId, lottoPage]);

  // Connection/Group loader
  const fetchConnections = useCallback(() => {
    setConnectionLoading(true);
    setError('');
    Promise.all([getUserConnections(userId), getUserGroups(userId)])
      .then(([c, g]) => { setConnections(c); setGroups(g); setConnectionLoaded(true); })
      .catch(() => setError('연결/그룹 데이터를 불러오는데 실패했습니다.'))
      .finally(() => setConnectionLoading(false));
  }, [userId]);

  // Lazy load on tab switch
  useEffect(() => {
    if (activeTab === 'login' && !loginLoaded) fetchLoginHistory();
    if (activeTab === 'fortune' && !fortuneLoaded) fetchFortunes();
    if (activeTab === 'compatibility' && !compatLoaded) fetchCompat();
    if (activeTab === 'lotto' && !lottoLoaded) fetchLotto();
    if (activeTab === 'connection' && !connectionLoaded) fetchConnections();
  }, [activeTab, loginLoaded, fortuneLoaded, compatLoaded, lottoLoaded, connectionLoaded, fetchLoginHistory, fetchFortunes, fetchCompat, fetchLotto, fetchConnections]);

  // Reload paginated tabs when page changes
  useEffect(() => { if (loginLoaded) fetchLoginHistory(); }, [loginPage]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fortuneLoaded) fetchFortunes(); }, [fortunePage]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (compatLoaded) fetchCompat(); }, [compatPage]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (lottoLoaded) fetchLotto(); }, [lottoPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + '...' : text;

  if (profileLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">로딩 중...</div>;
  }

  if (!profile) {
    return (
      <div>
        <Link to="/users" className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
          &larr; 유저 목록
        </Link>
        <ErrorBanner message={error || '유저를 찾을 수 없습니다.'} />
      </div>
    );
  }

  return (
    <div>
      <Link to="/users" className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
        &larr; 유저 목록
      </Link>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {profile.name || '이름 없음'} <span className="text-gray-400 text-lg">#{profile.id}</span>
      </h2>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {/* Tab navigation */}
      <div className="hidden sm:flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Mobile tab select */}
      <div className="sm:hidden mb-4">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as TabKey)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {TABS.map((tab) => (
            <option key={tab.key} value={tab.key}>{tab.label}</option>
          ))}
        </select>
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {[
              { label: 'ID', value: profile.id },
              { label: '이름', value: profile.name || '-' },
              { label: '소셜 로그인', value: profile.provider || '-' },
              { label: '성별', value: profile.gender || '-' },
              { label: '생년월일', value: profile.birthDate },
              { label: '권한', value: profile.role },
              { label: '마지막 로그인', value: profile.lastLoginAt ? formatDate(profile.lastLoginAt, true) : '-' },
              { label: '예감 알림 시간', value: `${profile.fortuneScheduleHour}시` },
              { label: '가입일', value: formatDate(profile.createdAt, true) },
            ].map((item) => (
              <div key={item.label} className="border-b border-gray-100 pb-3">
                <dt className="text-xs font-medium text-gray-500 uppercase mb-1">{item.label}</dt>
                <dd className="text-sm text-gray-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Login history tab */}
      {activeTab === 'login' && (
        <div>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">소셜</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">IP</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">User Agent</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">시간</th>
                </tr>
              </thead>
              <tbody>
                {loginLoading ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">로딩 중...</td></tr>
                ) : !loginData || loginData.content.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">로그인 기록이 없습니다.</td></tr>
                ) : (
                  loginData.content.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.provider}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.ipAddress || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.userAgent || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.createdAt, true)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {loginLoading ? (
              <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">로딩 중...</div>
            ) : !loginData || loginData.content.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">로그인 기록이 없습니다.</div>
            ) : (
              loginData.content.map((item, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.provider}</span>
                    <span className="text-xs text-gray-500">{formatDate(item.createdAt, true)}</span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>IP: {item.ipAddress || '-'}</div>
                    <div className="truncate">UA: {item.userAgent || '-'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          {loginData && (
            <Pagination page={loginData.page} totalPages={loginData.totalPages} onPageChange={setLoginPage} />
          )}
        </div>
      )}

      {/* Fortune tab */}
      {activeTab === 'fortune' && (
        <div>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">날짜</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">점수</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">내용</th>
                </tr>
              </thead>
              <tbody>
                {fortuneLoading ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">로딩 중...</td></tr>
                ) : !fortuneData || fortuneData.content.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">예감 데이터가 없습니다.</td></tr>
                ) : (
                  fortuneData.content.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.score ?? '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md">{truncate(item.content, 80)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {fortuneLoading ? (
              <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">로딩 중...</div>
            ) : !fortuneData || fortuneData.content.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">예감 데이터가 없습니다.</div>
            ) : (
              fortuneData.content.map((item, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.date}</span>
                    <span className="text-xs text-gray-500">점수: {item.score ?? '-'}</span>
                  </div>
                  <p className="text-xs text-gray-500">{truncate(item.content, 100)}</p>
                </div>
              ))
            )}
          </div>
          {fortuneData && (
            <Pagination page={fortuneData.page} totalPages={fortuneData.totalPages} onPageChange={setFortunePage} />
          )}
        </div>
      )}

      {/* Compatibility tab */}
      {activeTab === 'compatibility' && (
        <div>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">상대</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">관계</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">날짜</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">점수</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">내용</th>
                </tr>
              </thead>
              <tbody>
                {compatLoading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">로딩 중...</td></tr>
                ) : !compatData || compatData.content.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">궁합 데이터가 없습니다.</td></tr>
                ) : (
                  compatData.content.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.partnerName || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.relationType}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.score}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md">{truncate(item.content, 80)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {compatLoading ? (
              <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">로딩 중...</div>
            ) : !compatData || compatData.content.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">궁합 데이터가 없습니다.</div>
            ) : (
              compatData.content.map((item, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.partnerName || '-'}</span>
                    <span className="text-xs text-gray-500">{item.relationType}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span>{item.date}</span>
                    <span>점수: {item.score}</span>
                  </div>
                  <p className="text-xs text-gray-500">{truncate(item.content, 100)}</p>
                </div>
              ))
            )}
          </div>
          {compatData && (
            <Pagination page={compatData.page} totalPages={compatData.totalPages} onPageChange={setCompatPage} />
          )}
        </div>
      )}

      {/* Lotto tab */}
      {activeTab === 'lotto' && (
        <div>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">회차</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">세트</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">번호</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">등수</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">당첨금</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">확인</th>
                </tr>
              </thead>
              <tbody>
                {lottoLoading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">로딩 중...</td></tr>
                ) : !lottoData || lottoData.content.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">로또 데이터가 없습니다.</td></tr>
                ) : (
                  lottoData.content.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.round}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.setNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.numbers.join(', ')}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.rank || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.prizeAmount != null ? item.prizeAmount.toLocaleString() + '원' : '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.evaluated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.evaluated ? '완료' : '대기'}
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
            {lottoLoading ? (
              <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">로딩 중...</div>
            ) : !lottoData || lottoData.content.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">로또 데이터가 없습니다.</div>
            ) : (
              lottoData.content.map((item, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.round}회 세트 {item.setNumber}</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.evaluated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.evaluated ? '완료' : '대기'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>번호: {item.numbers.join(', ')}</div>
                    <div>등수: {item.rank || '-'} / 당첨금: {item.prizeAmount != null ? item.prizeAmount.toLocaleString() + '원' : '-'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          {lottoData && (
            <Pagination page={lottoData.page} totalPages={lottoData.totalPages} onPageChange={setLottoPage} />
          )}
        </div>
      )}

      {/* Connection/Group tab */}
      {activeTab === 'connection' && (
        <div className="space-y-6">
          {connectionLoading ? (
            <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">로딩 중...</div>
          ) : (
            <>
              {/* Connections */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">연결 ({connections.length})</h3>
                {connections.length === 0 ? (
                  <p className="text-sm text-gray-500">연결된 사용자가 없습니다.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {connections.map((conn, i) => (
                      <li key={i} className="py-3 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{conn.partnerName || '이름 없음'}</span>
                          <span className="text-xs text-gray-400 ml-2">#{conn.partnerId}</span>
                        </div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {conn.relationType}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Groups */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">그룹 ({groups.length})</h3>
                {groups.length === 0 ? (
                  <p className="text-sm text-gray-500">참여 중인 그룹이 없습니다.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {groups.map((group, i) => (
                      <li key={i} className="py-3 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{group.name}</span>
                          <span className="text-xs text-gray-400 ml-2">{group.memberCount}명</span>
                        </div>
                        {group.isOwner && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            방장
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
