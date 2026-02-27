import { useEffect, useState } from 'react';
import { getAppVersions, updateAppVersion } from '../api/admin';
import ErrorBanner from '../components/ErrorBanner';
import type { AppVersionConfigResponse } from '../types';

const platformLabels: Record<string, string> = {
  ios: 'iOS',
  android: 'Android',
};

const platformIcons: Record<string, string> = {
  ios: '🍎',
  android: '🤖',
};

const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

function validateMinVersion(value: string): string | null {
  if (!value.trim()) return '최소 버전을 입력해주세요.';
  if (!VERSION_REGEX.test(value.trim())) return '버전 형식이 올바르지 않습니다. (예: 1.0.0)';
  return null;
}

function validateStoreUrl(value: string): string | null {
  if (!value.trim()) return '스토어 URL을 입력해주세요.';
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return '올바른 URL을 입력해주세요.';
  } catch {
    return '올바른 URL을 입력해주세요.';
  }
  return null;
}

export default function AppVersionPage() {
  const [configs, setConfigs] = useState<AppVersionConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editMinVersion, setEditMinVersion] = useState('');
  const [editStoreUrl, setEditStoreUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ minVersion?: string; storeUrl?: string }>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      setError('');
      const data = await getAppVersions();
      setConfigs(data);
    } catch {
      setError('앱 버전 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(config: AppVersionConfigResponse) {
    setEditingPlatform(config.platform);
    setEditMinVersion(config.minVersion);
    setEditStoreUrl(config.storeUrl);
    setFieldErrors({});
    setError('');
  }

  function cancelEdit() {
    setEditingPlatform(null);
    setEditMinVersion('');
    setEditStoreUrl('');
    setFieldErrors({});
  }

  function validateForm(): boolean {
    const minVersionErr = validateMinVersion(editMinVersion);
    const storeUrlErr = validateStoreUrl(editStoreUrl);
    setFieldErrors({ minVersion: minVersionErr ?? undefined, storeUrl: storeUrlErr ?? undefined });
    return !minVersionErr && !storeUrlErr;
  }

  async function saveEdit(platform: string) {
    if (!validateForm()) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateAppVersion(platform, {
        minVersion: editMinVersion.trim(),
        storeUrl: editStoreUrl.trim(),
      });
      setConfigs((prev) =>
        prev.map((c) => (c.platform === platform ? updated : c))
      );
      setEditingPlatform(null);
    } catch {
      setError('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">앱 버전 관리</h2>
      <ErrorBanner message={error} onDismiss={() => setError('')} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configs.map((config) => {
          const isEditing = editingPlatform === config.platform;

          return (
            <div
              key={config.platform}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {platformIcons[config.platform] ?? '📱'}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {platformLabels[config.platform] ?? config.platform}
                  </h3>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => startEdit(config)}
                    className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    수정
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      최소 버전
                    </label>
                    <input
                      type="text"
                      value={editMinVersion}
                      onChange={(e) => {
                        setEditMinVersion(e.target.value);
                        if (fieldErrors.minVersion) {
                          setFieldErrors((prev) => ({ ...prev, minVersion: undefined }));
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm ${
                        fieldErrors.minVersion ? 'border-red-400' : 'border-gray-300'
                      }`}
                      placeholder="1.0.0"
                    />
                    {fieldErrors.minVersion && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.minVersion}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      스토어 URL
                    </label>
                    <input
                      type="text"
                      value={editStoreUrl}
                      onChange={(e) => {
                        setEditStoreUrl(e.target.value);
                        if (fieldErrors.storeUrl) {
                          setFieldErrors((prev) => ({ ...prev, storeUrl: undefined }));
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm ${
                        fieldErrors.storeUrl ? 'border-red-400' : 'border-gray-300'
                      }`}
                      placeholder="https://..."
                    />
                    {fieldErrors.storeUrl && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.storeUrl}</p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => saveEdit(config.platform)}
                      disabled={saving}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">최소 버전</span>
                    <p className="text-lg font-mono font-semibold text-gray-800">
                      {config.minVersion}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">스토어 URL</span>
                    <p className="text-sm text-gray-700 break-all">
                      {config.storeUrl}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">최종 수정</span>
                    <p className="text-sm text-gray-700">
                      {new Date(config.updatedAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
