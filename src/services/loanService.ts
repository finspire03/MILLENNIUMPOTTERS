import { supabase } from '../lib/supabase';

export interface LoanApplication {
  id?: string;
  customer_id: string;
  loan_product_id: string;
  agent_id: string;
  branch_id: string;
  purpose?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'disbursed';
  approved_by?: string;
  approval_date?: string;
  rejection_reason?: string;
  disbursement_date?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
}

class LoanService {
  async createLoanApplication(applicationData: LoanApplication) {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .insert(applicationData)
        .select(`
          *,
          customer:customers(*),
          agent:users(*),
          loan_product:loan_products(*),
          branch:branches(*)
        `)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create loan application error:', error);
      throw error;
    }
  }

  async getLoanApplications(filters?: {
    branchId?: string;
    agentId?: string;
    status?: string;
    customerId?: string;
  }) {
    try {
      let query = supabase
        .from('loan_applications')
        .select(`
          *,
          customer:customers(*),
          agent:users(*),
          loan_product:loan_products(*),
          branch:branches(*)
        `);

      if (filters?.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }
      if (filters?.agentId) {
        query = query.eq('agent_id', filters.agentId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get loan applications error:', error);
      throw error;
    }
  }

  async approveLoan(loanId: string, approverData: { userId: string; notes?: string }) {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .update({
          status: 'approved',
          approved_by: approverData.userId,
          approval_date: new Date().toISOString().split('T')[0],
          notes: approverData.notes
        })
        .eq('id', loanId)
        .select(`
          *,
          customer:customers(*),
          agent:users(*),
          loan_product:loan_products(*)
        `)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Approve loan error:', error);
      throw error;
    }
  }

  async rejectLoan(loanId: string, rejectionData: { reason: string; userId: string }) {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .update({
          status: 'rejected',
          rejection_reason: rejectionData.reason,
          approved_by: rejectionData.userId,
          approval_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', loanId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Reject loan error:', error);
      throw error;
    }
  }

  async disburseLoan(loanId: string, disbursementData: {
    disbursementDate: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .update({
          status: 'disbursed',
          disbursement_date: disbursementData.disbursementDate,
          start_date: disbursementData.startDate,
          end_date: disbursementData.endDate,
          notes: disbursementData.notes
        })
        .eq('id', loanId)
        .select(`
          *,
          customer:customers(*),
          loan_product:loan_products(*)
        `)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Failed to disburse loan, record not found after update.");

      await this.createPaymentSchedule(data);

      return data;
    } catch (error) {
      console.error('Disburse loan error:', error);
      throw error;
    }
  }

  async createPaymentSchedule(loanApplication: any) {
    try {
      const { error } = await supabase.rpc('create_weekly_payment_schedule', {
        p_loan_application_id: loanApplication.id,
        p_customer_id: loanApplication.customer_id,
        p_agent_id: loanApplication.agent_id,
        p_branch_id: loanApplication.branch_id,
        p_start_date: loanApplication.start_date,
        p_duration_days: loanApplication.loan_product.duration_days
      });

      if (error) throw error;
    } catch (error) {
      console.error('Create payment schedule error:', error);
      throw error;
    }
  }

  async getLoanProducts() {
    try {
      const { data, error } = await supabase
        .from('loan_products')
        .select('*')
        .eq('is_active', true)
        .order('principal_amount');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get loan products error:', error);
      throw error;
    }
  }
}

export const loanService = new LoanService();
