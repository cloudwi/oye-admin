import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './hooks/useAuth';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InquiryListPage from './pages/InquiryListPage';
import InquiryDetailPage from './pages/InquiryDetailPage';
import UserListPage from './pages/UserListPage';

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
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
