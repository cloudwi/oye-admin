import React from 'react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 text-red-400 hover:text-red-600 transition-colors"
          aria-label="닫기"
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default React.memo(ErrorBanner);
