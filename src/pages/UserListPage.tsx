import { useEffect, useState, useCallback } from 'react';
import { getUsers, updateUserRole } from '../api/admin';
import ErrorBanner from '../components/ErrorBanner';
import Pagination from '../components/Pagination';
import type { AdminUserResponse, PageResponse } from '../types';

export default function UserListPage() {
  const [data, setData] = useState<PageResponse<AdminUserResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError('');
    getUsers(page, 20, search || undefined)
      .then(setData)
      .catch(() => setError('유저 목록을 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const handleToggleRole = async (user: AdminUserResponse) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`${user.name}님의 권한을 ${newRole}로 변경하시겠습니까?`)) return;
    setError('');
    try {
      await updateUserRole(user.id, newRole);
      fetchUsers();
    } catch {
      setError('권한 변경에 실패했습니다.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">유저 관리</h2>
      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="이름으로 검색"
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          검색
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearchInput(''); setSearch(''); setPage(0); }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
        )}
      </form>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">ID</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">이름</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">생년월일</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">권한</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">가입일</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">로딩 중...</td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">유저가 없습니다.</td>
              </tr>
            ) : (
              data.content.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{user.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.birthDate}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleRole(user)}
                      className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                        user.role === 'ADMIN'
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      {user.role === 'ADMIN' ? 'USER로 변경' : 'ADMIN으로 변경'}
                    </button>
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
          <div className="bg-white rounded-xl shadow-sm px-4 py-12 text-center text-gray-500">유저가 없습니다.</div>
        ) : (
          data.content.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span>#{user.id}</span>
                <span>{user.birthDate}</span>
                <span>{new Date(user.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <button
                onClick={() => handleToggleRole(user)}
                className={`text-xs px-3 py-1.5 rounded font-medium transition-colors w-full ${
                  user.role === 'ADMIN'
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                {user.role === 'ADMIN' ? 'USER로 변경' : 'ADMIN으로 변경'}
              </button>
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
