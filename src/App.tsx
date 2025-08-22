import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import EmailVerification from './pages/auth/EmailVerification';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AgentDashboard from './pages/agent/AgentDashboard';
import SubAdminDashboard from './pages/subadmin/SubAdminDashboard';

// Admin Pages
import BranchManagement from './pages/admin/BranchManagement';
import UserManagement from './pages/admin/UserManagement';
import AdminLoanManagement from './pages/admin/LoanManagement';
import TransactionMonitoring from './pages/admin/TransactionMonitoring';
import Analytics from './pages/admin/Analytics';

// Agent Pages
import CustomerRegistration from './pages/agent/CustomerRegistration';
import CustomerList from './pages/agent/CustomerList';
import NewLoanApplication from './pages/agent/NewLoanApplication';
import DailyPayments from './pages/agent/DailyPayments';
import WeeklyTrackingSheet from './pages/agent/WeeklyTrackingSheet';

// Sub-Admin Pages
import AgentManagement from './pages/subadmin/AgentManagement';
import SubAdminLoanManagement from './pages/subadmin/LoanManagement';
import BranchAnalytics from './pages/subadmin/BranchAnalytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/auth/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/auth/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/auth/verify-email" element={<EmailVerification />} />

            {/* Dashboard Routes - Auto-redirect based on role */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/branches" element={<ProtectedRoute roles={['admin']}><BranchManagement /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/loans" element={<ProtectedRoute roles={['admin']}><AdminLoanManagement /></ProtectedRoute>} />
            <Route path="/admin/transactions" element={<ProtectedRoute roles={['admin']}><TransactionMonitoring /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><Analytics /></ProtectedRoute>} />

            {/* Sub-Admin Routes */}
            <Route path="/subadmin" element={<ProtectedRoute roles={['sub_admin']}><SubAdminDashboard /></ProtectedRoute>} />
            <Route path="/subadmin/agents" element={<ProtectedRoute roles={['sub_admin']}><AgentManagement /></ProtectedRoute>} />
            <Route path="/subadmin/loans" element={<ProtectedRoute roles={['sub_admin']}><SubAdminLoanManagement /></ProtectedRoute>} />
            <Route path="/subadmin/analytics" element={<ProtectedRoute roles={['sub_admin']}><BranchAnalytics /></ProtectedRoute>} />

            {/* Agent Routes */}
            <Route path="/agent" element={<ProtectedRoute roles={['agent']}><AgentDashboard /></ProtectedRoute>} />
            <Route path="/agent/customers/new" element={<ProtectedRoute roles={['agent']}><CustomerRegistration /></ProtectedRoute>} />
            <Route path="/agent/customers" element={<ProtectedRoute roles={['agent']}><CustomerList /></ProtectedRoute>} />
            <Route path="/agent/loans/new" element={<ProtectedRoute roles={['agent']}><NewLoanApplication /></ProtectedRoute>} />
            <Route path="/agent/payments" element={<ProtectedRoute roles={['agent']}><DailyPayments /></ProtectedRoute>} />
            <Route path="/agent/weekly-sheet" element={<ProtectedRoute roles={['agent']}><WeeklyTrackingSheet /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Component to route to appropriate dashboard based on user role
const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/auth/login" replace />;
  
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'sub_admin':
      return <Navigate to="/subadmin" replace />;
    case 'agent':
      return <Navigate to="/agent" replace />;
    default:
      return <Navigate to="/auth/login" replace />;
  }
};

export default App;
