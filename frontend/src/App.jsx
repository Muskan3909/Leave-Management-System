import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ApplyLeavePage from './pages/ApplyLeavePage';
import LeaveHistoryPage from './pages/LeaveHistoryPage';
import LeaveDetailsPage from './pages/LeaveDetailsPage';
import PendingApprovalsPage from './pages/PendingApprovalsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/history" element={<LeaveHistoryPage />} />
            <Route path="/leaves/:id" element={<LeaveDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Employee-only */}
            <Route
              path="/apply"
              element={
                <ProtectedRoute roles={['EMPLOYEE']}>
                  <ApplyLeavePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply/:id"
              element={
                <ProtectedRoute roles={['EMPLOYEE']}>
                  <ApplyLeavePage />
                </ProtectedRoute>
              }
            />

            {/* Manager-only */}
            <Route
              path="/approvals"
              element={
                <ProtectedRoute roles={['MANAGER']}>
                  <PendingApprovalsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
