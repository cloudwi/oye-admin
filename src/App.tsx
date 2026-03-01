import React, { useState, useMemo, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './hooks/useAuth';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const InquiryListPage = React.lazy(() => import('./pages/InquiryListPage'));
const InquiryDetailPage = React.lazy(() => import('./pages/InquiryDetailPage'));
const UserListPage = React.lazy(() => import('./pages/UserListPage'));
const AppVersionPage = React.lazy(() => import('./pages/AppVersionPage'));
const PushNotificationPage = React.lazy(() => import('./pages/PushNotificationPage'));

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem('accessToken'),
  );

  const auth = useMemo(() => ({
    accessToken,
    isAuthenticated: !!accessToken,
    login: (at: string, rt: string) => {
      localStorage.setItem('accessToken', at);
      localStorage.setItem('refreshToken', rt);
      setAccessToken(at);
    },
    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
    },
  }), [accessToken]);

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={
              auth.isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            } />
            <Route element={
              <PrivateRoute><Layout /></PrivateRoute>
            }>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/inquiries" element={<InquiryListPage />} />
              <Route path="/inquiries/:id" element={<InquiryDetailPage />} />
              <Route path="/users" element={<UserListPage />} />
              <Route path="/app-versions" element={<AppVersionPage />} />
              <Route path="/push" element={<PushNotificationPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
