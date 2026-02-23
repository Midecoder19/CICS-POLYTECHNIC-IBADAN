import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { initPerformanceOptimizations } from "./utils/performance.js";

import Dashboard from "./pages/Dashboard";
const Login = lazy(() => import("./pages/Login"));
const Verification = lazy(() => import("./pages/Verification"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const StockPage = lazy(() => import("./pages/StockPage/StockPage"));
const MemberDashboard = lazy(() => import("./pages/Member/MemberDashboard"));
const MemberActivation = lazy(() => import("./pages/Member/MemberActivation"));
const LoansPage = lazy(() => import("./pages/Member/LoansPage"));
const LedgerPage = lazy(() => import("./pages/Member/LedgerPage"));
const ProfilePage = lazy(() => import("./pages/Member/ProfilePage"));
const CommonPage = lazy(() => import("./pages/CommonPage/CommonPage"));
const AccountPage = lazy(() => import("./pages/AccountPage/AccountPage"));

import { useAuth, AuthProvider } from "./contexts/AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { MemberAuthProvider } from "./contexts/MemberAuthContext.jsx";
import MemberRoute from "./components/MemberRoute.jsx";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // Debug logging
  console.log('ProtectedRoute Debug:', {
    user: user,
    allowedRoles: allowedRoles,
    userRole: user?.role,
    hasAccess: user && (!allowedRoles || allowedRoles.includes(user.role))
  });

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`ProtectedRoute: User role ${user.role} does not match allowed roles ${allowedRoles}`);

    // Redirect based on actual user role
    if (user.role === 'member') {
      console.log('ProtectedRoute: Redirecting member to /member');
      return <Navigate to="/member" />;
    } else if (user.role === 'admin' || user.role === 'staff') {
      console.log('ProtectedRoute: Redirecting admin/staff to /dashboard');
      return <Navigate to="/dashboard" />;
    } else {
      console.log('ProtectedRoute: Unknown role, redirecting to /login');
      return <Navigate to="/login" />;
    }
  }

  console.log('ProtectedRoute: Access granted, rendering children');
  return children;
};

// Root Route Component - always redirect to signup
const RootRoute = () => {
  return <Navigate to="/signup" replace />;
};

const App = () => {
  const navigate = useNavigate();

  // Initialize performance optimizations
  useEffect(() => {
    initPerformanceOptimizations();
  }, []);

  return (
    <ThemeProvider>
      <MemberAuthProvider>
          <Suspense fallback={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              ⚡ Loading at lightning speed...
            </div>
          }>
          <Routes>
          {/* Smart root redirect based on authentication */}
          <Route path="/" element={<RootRoute />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/member/activation" element={<MemberActivation />} />
          <Route path="/member/activation/:token" element={<MemberActivation />} />

          {/* Verification */}
          <Route path="/verify" element={<Verification />} />

          {/* Reset Password */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Member Routes - Protected */}
          <Route
            path="/member/dashboard"
            element={
              <MemberRoute>
                <MemberDashboard />
              </MemberRoute>
            }
          />
          <Route
            path="/member/loans"
            element={
              <MemberRoute>
                <LoansPage />
              </MemberRoute>
            }
          />
          <Route
            path="/member/ledger"
            element={
              <MemberRoute>
                <LedgerPage />
              </MemberRoute>
            }
          />
          <Route
            path="/member/profile"
            element={
              <MemberRoute>
                <ProfilePage />
              </MemberRoute>
            }
          />

          {/* Legacy member route - redirect to dashboard */}
          <Route path="/member" element={<Navigate to="/member/dashboard" />} />

          {/* Staff/Admin Dashboard - Protected */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute allowedRoles={['admin', 'staff']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/signup" />} />
        </Routes>
      </Suspense>
  </MemberAuthProvider>
  </ThemeProvider>
  );
};

export default App;
