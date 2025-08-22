import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  Banknote, 
  TrendingUp, 
  Building2,
  UserCheck,
  AlertCircle,
  Calendar
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { loanService } from '../../services/loanService';
import { customerService } from '../../services/customerService';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/helpers';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    totalLoans: 0,
    totalDisbursed: 0,
    collectionRate: 0,
    pendingApprovals: 0,
    overduePayments: 0,
    activeAgents: 0,
    branchPerformance: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data concurrently
      const [customers, loans, transactions] = await Promise.all([
        customerService.getCustomers(),
        loanService.getLoanApplications(),
        paymentService.getTransactions()
      ]);

      // Calculate metrics
      const totalCustomers = customers?.length || 0;
      const totalLoans = loans?.length || 0;
      const pendingApprovals = loans?.filter(l => l.status === 'pending').length || 0;
      const disbursedLoans = loans?.filter(l => l.status === 'disbursed') || [];
      const totalDisbursed = disbursedLoans.reduce((sum, loan) => sum + (loan.loan_product?.principal_amount || 0), 0);
      
      // Calculate collection rate (simplified)
      const collectionRate = Math.random() * 20 + 80; // Mock data for now
      
      setDashboardData({
        totalCustomers,
        totalLoans,
        totalDisbursed,
        collectionRate,
        pendingApprovals,
        overduePayments: Math.floor(Math.random() * 50), // Mock data
        activeAgents: Math.floor(Math.random() * 25) + 15, // Mock data
        branchPerformance: [] // Will be implemented with real branch data
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const metricCards = [
    {
      title: 'Total Customers',
      value: dashboardData.totalCustomers.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      title: 'Total Loans',
      value: dashboardData.totalLoans.toLocaleString(),
      icon: CreditCard,
      color: 'from-emerald-500 to-emerald-600',
      change: '+8%'
    },
    {
      title: 'Total Disbursed',
      value: formatCurrency(dashboardData.totalDisbursed),
      icon: Banknote,
      color: 'from-gold-500 to-gold-600',
      change: '+15%'
    },
    {
      title: 'Collection Rate',
      value: `${dashboardData.collectionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      change: '+2%'
    }
  ];

  const alertCards = [
    {
      title: 'Pending Approvals',
      value: dashboardData.pendingApprovals,
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-600',
      urgency: 'high'
    },
    {
      title: 'Overdue Payments',
      value: dashboardData.overduePayments,
      icon: Calendar,
      color: 'bg-red-100 text-red-600',
      urgency: 'critical'
    },
    {
      title: 'Active Agents',
      value: dashboardData.activeAgents,
      icon: UserCheck,
      color: 'bg-green-100 text-green-600',
      urgency: 'normal'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.first_name}! Here's what's happening across all branches.</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-NG', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-sm text-emerald-600 font-medium mt-1">{metric.change} from last month</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {alertCards.map((alert, index) => (
            <motion.div
              key={alert.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{alert.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{alert.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${alert.color}`}>
                    <alert.icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Loan Applications */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Loan Applications</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-electric-500 to-electric-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">JD</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">John Doe</p>
                      <p className="text-sm text-gray-500">₦50,000 Loan</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Branch Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900">Igando Branch</p>
                    <p className="text-sm text-gray-500">125 Active Loans</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">96.8%</p>
                  <p className="text-xs text-gray-500">Collection Rate</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Abule-Egba Branch</p>
                    <p className="text-sm text-gray-500">98 Active Loans</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">94.2%</p>
                  <p className="text-xs text-gray-500">Collection Rate</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
