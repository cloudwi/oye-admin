import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/', label: '대시보드', icon: '📊' },
  { to: '/inquiries', label: '문의 관리', icon: '💬' },
  { to: '/users', label: '유저 관리', icon: '👥' },
  { to: '/push', label: '푸시 알림', icon: '🔔' },
  { to: '/app-versions', label: '앱 버전 관리', icon: '📱' },
];

const SIDEBAR_KEY = 'oye-admin-sidebar';

export default function Layout() {
  const { logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY);
    return saved !== null ? saved === 'true' : true;
  });
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(desktopSidebarOpen));
  }, [desktopSidebarOpen]);

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  const sidebarLinks = (closeFn?: () => void) => (
    <>
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-indigo-600">OYE Admin</h1>
          <p className="text-sm text-gray-500 mt-1">관리자 대시보드</p>
        </div>
        {/* Desktop close button inside sidebar */}
        <button
          onClick={() => setDesktopSidebarOpen(false)}
          className="hidden md:block p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="사이드바 닫기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={closeFn}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          로그아웃
        </button>
      </div>
    </>
  );

  const pageTitle = navItems.find((item) =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  )?.label ?? '';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop sidebar - collapsible */}
      <aside
        className={`hidden md:flex bg-white shadow-md flex-col shrink-0 transition-[width] duration-200 ease-in-out overflow-hidden ${
          desktopSidebarOpen ? 'w-64' : 'w-0'
        }`}
      >
        <div className="w-64 h-full flex flex-col">
          {sidebarLinks()}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md flex flex-col transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarLinks(closeMobileSidebar)}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white shadow-sm shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="메뉴 열기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Desktop sidebar toggle (visible when sidebar is closed) */}
          {!desktopSidebarOpen && (
            <button
              onClick={() => setDesktopSidebarOpen(true)}
              className="hidden md:block p-1.5 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="사이드바 열기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-bold text-indigo-600">{pageTitle || 'OYE Admin'}</h1>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
