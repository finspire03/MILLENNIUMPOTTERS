import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, User, Calendar, Banknote, Building2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { loanService } from '../../services/loanService';
import { useAuth } from '../../hooks/useAuth';

const LoanApprovalTable = ({ loans, onActionComplete }) => {
  const [loadingAction, setLoadingAction] = useState<{ [key: string]: 'approve' | 'reject' | null }>({});
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { user } = useAuth();

  const handleApprove = async (loanId: string) => {
    if (!user) return;
    setLoadingAction(prev => ({ ...prev, [loanId]: 'approve' }));
    try {
      await loanService.approveLoan(loanId, { userId: user.id });
      onActionComplete();
    } catch (error) {
      console.error('Failed to approve loan', error);
    } finally {
      setLoadingAction(prev => ({ ...prev, [loanId]: null }));
    }
  };

  const openRejectModal = (loan: any) => {
    setSelectedLoan(loan);
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedLoan || !user || !rejectionReason) return;
    const loanId = selectedLoan.id;
    setLoadingAction(prev => ({ ...prev, [loanId]: 'reject' }));
    setRejectModalOpen(false);
    try {
      await loanService.rejectLoan(loanId, { userId: user.id, reason: rejectionReason });
      onActionComplete();
    } catch (error) {
      console.error('Failed to reject loan', error);
    } finally {
      setLoadingAction(prev => ({ ...prev, [loanId]: null }));
      setSelectedLoan(null);
      setRejectionReason('');
    }
  };

  if (loans.length === 0) {
    return (
      <div className="text-center py-12">
        <Check className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">All Clear!</h3>
        <p className="text-gray-500 mt-2">There are no pending loan applications to review.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Details</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent / Branch</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Date</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loans.map((loan) => (
              <motion.tr
                key={loan.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{loan.customer.first_name} {loan.customer.last_name}</div>
                      <div className="text-sm text-gray-500">{loan.customer.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Banknote className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(loan.loan_product.principal_amount)}</div>
                      <div className="text-sm text-gray-500">{loan.loan_product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{loan.agent.first_name} {loan.agent.last_name}</div>
                      <div className="text-sm text-gray-500">{loan.branch.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="text-sm text-gray-900">{formatDate(loan.application_date)}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => openRejectModal(loan)}
                      loading={loadingAction[loan.id] === 'reject'}
                      disabled={!!loadingAction[loan.id]}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => handleApprove(loan.id)}
                      loading={loadingAction[loan.id] === 'approve'}
                      disabled={!!loadingAction[loan.id]}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Loan Application"
        size="md"
      >
        <div>
          <p className="text-gray-600 mb-4">Please provide a reason for rejecting this loan application for <span className="font-bold">{selectedLoan?.customer.first_name} {selectedLoan?.customer.last_name}</span>.</p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-500 focus:border-electric-500"
            rows={4}
            placeholder="e.g., Incomplete documentation, poor credit history..."
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={handleReject}
              disabled={!rejectionReason}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LoanApprovalTable;
