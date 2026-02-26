import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [refreshToken, setRefreshToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refreshToken.trim()) return;

    setError('');
    setLoading(true);
    try {
      const data = await adminLogin(refreshToken.trim());
      login(data.accessToken, data.refreshToken);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { status?: number } })?.response?.status === 403
          ? '관리자 권한이 없습니다.'
          : '로그인에 실패했습니다. 토큰을 확인해주세요.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600">OYE Admin</h1>
          <p className="text-gray-500 mt-2">관리자 로그인</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
              Refresh Token
            </label>
            <textarea
              id="token"
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              placeholder="모바일 앱에서 발급받은 refreshToken을 입력하세요"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !refreshToken.trim()}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
