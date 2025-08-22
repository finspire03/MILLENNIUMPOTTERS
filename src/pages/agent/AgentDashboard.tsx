import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  Banknote, 
  Calendar,
  Plus,
  TrendingUp,
  Target,
  CheckCircle,
  Clock
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { customerService } from '../../services/customerService';
import { loanService } from '../../services/loanService';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, getWeekStartDate } from '../../utils/helpers';

const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    activeLoans: 0,
    todayCollections: 0,
    weeklyTarget: 50000,
    weeklyCollected: 0,
    pendingPayments: 0,
    completedPayments: 0
  });

  const [todayPayments, setTodayPayments] = useState([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      const weekStart = getWeekStartDate(new Date()).toISOString().split('T')[0];
      
      // Load data for this agent
      const [customers, loans, payments] = await Promise.all([
        customerService.getCustomers({ agentId: user.id }),
        loanService.getLoanApplications({ agentId: user.id, status: 'disbursed' }),
        paymentService.getAgentPaymentSchedule(user.id, today)
      ]);

      const totalCustomers = customers?.length || 0;
      const activeLoans = loans?.length || 0;
      const todayPaymentsData = payments || [];
      
      const completedPayments = todayPaymentsData.filter(p => p.is_paid).length;
      const pendingPayments = todayPaymentsData.filter(p => !p.is_paid).length;
      const todayCollections = todayPaymentsData
        .filter(p => p.is_paid)
        .reduce((sum, p) => sum + (p.actual_amount || 0), 0);

      setDashboardData({
        totalCustomers,
        activeLoans,
        todayCollections,
        weeklyTarget: 50000,
        weeklyCollected: todayCollections * 6, // Approximate weekly
        pendingPayments,
        completedPayments
      });

      setTodayPayments(todayPaymentsData.slice(0, 5)); // Show first 5
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

  const completionRate = dashboardData.completedPayments + dashboardData.pendingPayments > 0 
    ? (dashboardData.completedPayments / (dashboardData.completedPayments + dashboardData.pendingPayments)) * 100 
    : 0;

  const weeklyProgress = (dashboardData.weeklyCollected / dashboardData.weeklyTarget) * 100;

  const quickActions = [
    {
      title: 'Register Customer',
      description: 'Add a new customer to your portfolio',
      href: '/agent/customers/new',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'New Loan Application',
      description: 'Help customer apply for a loan',
      href: '/agent/loans/new',
      icon: CreditCard,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Record Payment',
      description: 'Update daily payment collections',
      href: '/agent/payments',
      icon: Banknote,
      color: 'from-gold-500 to-gold-600'
    },
    {
      title: 'Weekly Sheet',
      description: 'View weekly payment tracking',
      href: '/agent/weekly-sheet',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.first_name}! Here's your daily overview for {user?.branch?.name}.
            </p>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">My Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.totalCustomers}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Loans</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.activeLoans}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Today's Collections</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.todayCollections)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{completionRate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Today's Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Progress */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Payment Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">{dashboardData.completedPayments}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{dashboardData.pendingPayments}</span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{completionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Weekly Target */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Target</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Target</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(dashboardData.weeklyTarget)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">Collected</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(dashboardData.weeklyCollected)}</span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{weeklyProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link to={action.href}>
                  <div className="p-4 border border-gray-200 rounded-xl hover:border-electric-300 hover:shadow-lg transition-all duration-200 group">
                    <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Today's Payment Schedule */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Payment Schedule</h3>
            <Link to="/agent/payments">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          
          {todayPayments.length > 0 ? (
            <div className="space-y-3">
              {todayPayments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-electric-500 to-electric-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {payment.customer?.first_name?.charAt(0)}{payment.customer?.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {payment.customer?.first_name} {payment.customer?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expected: {formatCurrency(payment.expected_amount)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    payment.is_paid 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {payment.is_paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payments scheduled for today</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
