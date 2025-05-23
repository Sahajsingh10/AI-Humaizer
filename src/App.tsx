import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PaymentPage from './pages/payment/PaymentPage';

// Auth
import { useAuthStore } from './store/authStore';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, initialized } = useAuthStore();
  
  // Show loading spinner while authentication is being initialized or during loading
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // Only redirect to login after we've confirmed there's no authenticated user
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { fetchUserProfile, initialized } = useAuthStore();
  
  useEffect(() => {
    // Only fetch user profile if not already initialized
    if (!initialized) {
      fetchUserProfile();
    }
  }, [fetchUserProfile, initialized]);
  
  // Show loading spinner while the initial authentication check is happening
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="payment/:planId" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;