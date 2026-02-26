import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLoginKakao } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        login: (options: {
          success: (response: { access_token: string }) => void;
          fail: (error: unknown) => void;
        }) => void;
      };
    };
  }
}

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || '';

function initKakao() {
  if (window.Kakao && !window.Kakao.isInitialized() && KAKAO_JS_KEY) {
    window.Kakao.init(KAKAO_JS_KEY);
  }
}

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleKakaoLogin = () => {
    initKakao();

    if (!window.Kakao?.isInitialized()) {
      setError('카카오 SDK가 초기화되지 않았습니다. 관리자에게 문의하세요.');
      return;
    }

    setError('');
    setLoading(true);

    window.Kakao.Auth.login({
      success: async (response) => {
        try {
          const data = await adminLoginKakao(response.access_token);
          login(data.accessToken, data.refreshToken);
          navigate('/', { replace: true });
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status === 403) {
            setError('관리자 권한이 없는 계정입니다.');
          } else if (status === 401) {
            setError('가입되지 않은 계정입니다. 먼저 앱에서 가입해주세요.');
          } else {
            setError('로그인에 실패했습니다.');
          }
        } finally {
          setLoading(false);
        }
      },
      fail: () => {
        setError('카카오 로그인에 실패했습니다.');
        setLoading(false);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600">OYE Admin</h1>
          <p className="text-gray-500 mt-2">관리자 로그인</p>
        </div>
        <div className="space-y-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}
          <button
            onClick={handleKakaoLogin}
            disabled={loading}
            className="w-full py-3 bg-[#FEE500] text-[#191919] rounded-lg font-medium hover:bg-[#FDD835] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 0.6C4.029 0.6 0 3.713 0 7.55C0 9.944 1.558 12.06 3.931 13.295L2.933 16.844C2.845 17.152 3.213 17.396 3.48 17.214L7.673 14.43C8.108 14.478 8.55 14.5 9 14.5C13.971 14.5 18 11.387 18 7.55C18 3.713 13.971 0.6 9 0.6Z"
                fill="#191919"
              />
            </svg>
            {loading ? '로그인 중...' : '카카오로 로그인'}
          </button>
          <p className="text-xs text-center text-gray-400">
            ADMIN 권한이 있는 계정만 로그인할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
