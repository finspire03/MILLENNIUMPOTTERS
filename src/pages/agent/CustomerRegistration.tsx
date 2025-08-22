import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Phone, Briefcase, Landmark, Home, Shield, Plus, Trash2, Banknote } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import FormSection from '../../components/ui/FormSection';
import { useAuth } from '../../hooks/useAuth';
import { customerService, Guarantor } from '../../services/customerService';

const CustomerRegistration: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [customerData, setCustomerData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    address: '',
    occupation: '',
    monthly_income: '',
    bank_name: '',
    bank_account: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const [guarantors, setGuarantors] = useState<Partial<Guarantor>[]>([
    { type: 'primary', first_name: '', last_name: '', phone: '', address: '' }
  ]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGuarantorChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newGuarantors = [...guarantors];
    newGuarantors[index] = { ...newGuarantors[index], [e.target.name]: e.target.value };
    setGuarantors(newGuarantors);
  };

  const addGuarantor = () => {
    if (guarantors.length < 2) {
      setGuarantors([...guarantors, { type: 'secondary', first_name: '', last_name: '', phone: '', address: '' }]);
    }
  };

  const removeGuarantor = (index: number) => {
    if (guarantors.length > 1) {
      setGuarantors(guarantors.filter((_, i) => i !== index));
    }
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
      const finalCustomerData = {
        ...customerData,
        monthly_income: customerData.monthly_income ? parseFloat(customerData.monthly_income) : undefined,
        branch_id: user.branch_id,
        agent_id: user.id
      };

      await customerService.createCustomer(finalCustomerData, guarantors as Guarantor[]);
      
      // On success, navigate to the customer list or dashboard
      navigate('/agent/customers');

    } catch (err: any) {
      setError(err.message || 'Failed to register customer. Please check the details and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Customer Registration</h1>
          <p className="text-gray-600 mt-1">Add a new customer to your portfolio.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <FormSection title="Personal Information" description="Basic details of the customer.">
                <Input name="first_name" placeholder="First Name" icon={User} value={customerData.first_name} onChange={handleCustomerChange} required />
                <Input name="last_name" placeholder="Last Name" icon={User} value={customerData.last_name} onChange={handleCustomerChange} required />
                <Input name="date_of_birth" type="date" icon={User} value={customerData.date_of_birth} onChange={handleCustomerChange} />
                <Input name="occupation" placeholder="Occupation" icon={Briefcase} value={customerData.occupation} onChange={handleCustomerChange} />
              </FormSection>

              <FormSection title="Contact Information" description="How to reach the customer.">
                <Input name="phone" placeholder="Phone Number" icon={Phone} value={customerData.phone} onChange={handleCustomerChange} required />
                <Input name="email" placeholder="Email Address (Optional)" type="email" icon={Mail} value={customerData.email} onChange={handleCustomerChange} />
                <div className="md:col-span-2">
                  <Textarea name="address" placeholder="Residential Address" value={customerData.address} onChange={handleCustomerChange} required />
                </div>
              </FormSection>

              <FormSection title="Financial Information" description="Customer's financial and banking details.">
                <Input name="monthly_income" placeholder="Monthly Income (e.g., 50000)" type="number" icon={Banknote} value={customerData.monthly_income} onChange={handleCustomerChange} />
                <Input name="bank_name" placeholder="Bank Name" icon={Landmark} value={customerData.bank_name} onChange={handleCustomerChange} />
                <Input name="bank_account" placeholder="Bank Account Number" icon={Landmark} value={customerData.bank_account} onChange={handleCustomerChange} />
              </FormSection>

              <FormSection title="Emergency Contact" description="Contact person in case of emergencies.">
                <Input name="emergency_contact_name" placeholder="Full Name" icon={User} value={customerData.emergency_contact_name} onChange={handleCustomerChange} />
                <Input name="emergency_contact_phone" placeholder="Phone Number" icon={Phone} value={customerData.emergency_contact_phone} onChange={handleCustomerChange} />
              </FormSection>

              {/* Guarantors Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Guarantor Information</h3>
                    <p className="text-sm text-gray-500">At least one guarantor is required.</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={addGuarantor} disabled={guarantors.length >= 2}>
                    <Plus className="w-4 h-4 mr-2" /> Add Guarantor
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {guarantors.map((guarantor, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 rounded-lg space-y-4 relative"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-700">{guarantor.type === 'primary' ? 'Primary Guarantor' : 'Secondary Guarantor'}</h4>
                        {index > 0 && (
                          <Button type="button" size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => removeGuarantor(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input name="first_name" placeholder="First Name" value={guarantor.first_name} onChange={(e) => handleGuarantorChange(index, e)} required />
                        <Input name="last_name" placeholder="Last Name" value={guarantor.last_name} onChange={(e) => handleGuarantorChange(index, e)} required />
                        <Input name="phone" placeholder="Phone Number" value={guarantor.phone} onChange={(e) => handleGuarantorChange(index, e)} required />
                        <Input name="address" placeholder="Address" value={guarantor.address} onChange={(e) => handleGuarantorChange(index, e)} required />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
              <Button type="submit" size="lg" loading={loading}>
                <UserPlus className="w-5 h-5 mr-2" />
                Register Customer
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerRegistration;
