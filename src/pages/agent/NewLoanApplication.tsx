import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, User, FileText, DollarSign } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { customerService } from '../../services/customerService';
import { loanService } from '../../services/loanService';
import { formatCurrency } from '../../utils/helpers';

const NewLoanApplication: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  const [customers, setCustomers] = useState<any[]>([]);
  const [loanProducts, setLoanProducts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    customerId: '',
    loanProductId: '',
    purpose: ''
  });

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;
      try {
        setPageLoading(true);
        const [customersData, loanProductsData] = await Promise.all([
          customerService.getCustomers({ agentId: user.id, isActive: true }),
          loanService.getLoanProducts()
        ]);
        setCustomers(customersData || []);
        setLoanProducts(loanProductsData || []);
      } catch (err: any) {
        setError('Failed to load necessary data. Please try again later.');
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };
    loadInitialData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.branch_id) {
      setError('Could not identify your user or branch. Please log in again.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await loanService.createLoanApplication({
        customer_id: formData.customerId,
        loan_product_id: formData.loanProductId,
        purpose: formData.purpose,
        agent_id: user.id,
        branch_id: user.branch_id,
      });

      // On success, navigate to agent dashboard or loan list
      navigate('/agent');

    } catch (err: any) {
      setError(err.message || 'Failed to submit loan application.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Loan Application</h1>
          <p className="text-gray-600 mt-1">Submit a loan application on behalf of a customer.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer
                </label>
                <Select
                  name="customerId"
                  id="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  icon={User}
                  required
                >
                  <option value="" disabled>-- Choose a customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} ({c.phone})
                    </option>
                  ))}
                </Select>
                {customers.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    No active customers found. Please register a customer first.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="loanProductId" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Loan Product
                </label>
                <Select
                  name="loanProductId"
                  id="loanProductId"
                  value={formData.loanProductId}
                  onChange={handleChange}
                  icon={DollarSign}
                  required
                >
                  <option value="" disabled>-- Choose a loan product --</option>
                  {loanProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatCurrency(p.principal_amount)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Loan
                </label>
                <Textarea
                  name="purpose"
                  id="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g., To expand my small provision store..."
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
              <Button
                type="submit"
                size="lg"
                loading={loading}
                disabled={!formData.customerId || !formData.loanProductId}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Submit Application
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewLoanApplication;
