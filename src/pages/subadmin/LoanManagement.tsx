import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import LoanApprovalTable from '../../components/features/LoanApprovalTable';
import { loanService } from '../../services/loanService';
import { useAuth } from '../../hooks/useAuth';
import { AlertCircle } from 'lucide-react';

const SubAdminLoanManagement: React.FC = () => {
  const { user } = useAuth();
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.branch_id) {
      fetchPendingLoans();
    } else if (!user && !loading) {
      setError("Could not identify your branch. Please log in again.");
    }
  }, [user]);

  const fetchPendingLoans = async () => {
    if (!user?.branch_id) return;
    try {
      setLoading(true);
      setError('');
      const data = await loanService.getLoanApplications({ 
        status: 'pending',
        branchId: user.branch_id 
      });
      setPendingLoans(data || []);
    } catch (err: any) {
      setError('Failed to fetch loan applications for your branch. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Approval Queue</h1>
          <p className="text-gray-600 mt-1">
            Review and process pending loan applications for <span className="font-semibold text-navy-800">{user?.branch?.name}</span>.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Pending Applications</h3>
            <p className="text-sm text-gray-500 mt-1">
              There are <span className="font-bold text-electric-600">{pendingLoans.length}</span> applications awaiting your review.
            </p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <LoanApprovalTable loans={pendingLoans} onActionComplete={fetchPendingLoans} />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SubAdminLoanManagement;
