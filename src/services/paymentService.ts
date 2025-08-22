import { supabase } from '../lib/supabase';

export interface PaymentRecord {
  id?: string;
  loan_application_id: string;
  customer_id: string;
  agent_id: string;
  branch_id: string;
  payment_date: string;
  expected_amount: number;
  actual_amount?: number;
  payment_method?: string;
  is_paid?: boolean;
  payment_time?: string;
  notes?: string;
}

class PaymentService {
  async recordPayment(paymentData: PaymentRecord) {
    try {
      const { data, error } = await supabase
        .from('daily_payments')
        .upsert({
          ...paymentData,
          is_paid: true,
          payment_time: new Date().toISOString()
        })
        .select(`
          *,
          customer:customers(*),
          loan_application:loan_applications(*)
        `)
        .maybeSingle();

      if (error) throw error;

      await this.createTransaction({
        loan_application_id: paymentData.loan_application_id,
        customer_id: paymentData.customer_id,
        agent_id: paymentData.agent_id,
        branch_id: paymentData.branch_id,
        transaction_type: 'daily_payment',
        amount: paymentData.actual_amount || paymentData.expected_amount,
        payment_method: paymentData.payment_method,
        description: `Daily payment for loan application ${paymentData.loan_application_id}`
      });

      return data;
    } catch (error) {
      console.error('Record payment error:', error);
      throw error;
    }
  }

  async updateWeeklyTracking(weeklyData: {
    loan_application_id: string;
    customer_id: string;
    agent_id: string;
    branch_id: string;
    week_start: string;
    day: string;
    amount: number;
    is_paid: boolean;
  }) {
    try {
      const dayColumn = `${weeklyData.day.toLowerCase()}_paid`;
      const amountColumn = `${weeklyData.day.toLowerCase()}_amount`;

      const updateData = {
        [dayColumn]: weeklyData.is_paid,
        [amountColumn]: weeklyData.amount
      };

      const { data, error } = await supabase
        .from('weekly_payment_tracking')
        .upsert({
          loan_application_id: weeklyData.loan_application_id,
          customer_id: weeklyData.customer_id,
          agent_id: weeklyData.agent_id,
          branch_id: weeklyData.branch_id,
          week_start: weeklyData.week_start,
          ...updateData
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update weekly tracking error:', error);
      throw error;
    }
  }

  async getAgentPaymentSchedule(agentId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('daily_payments')
        .select(`
          *,
          customer:customers(*),
          loan_application:loan_applications(
            *,
            loan_product:loan_products(*)
          )
        `)
        .eq('agent_id', agentId)
        .eq('payment_date', date)
        .order('customer_id');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get agent payment schedule error:', error);
      throw error;
    }
  }

  async getWeeklyPaymentTracking(filters: {
    agentId?: string;
    branchId?: string;
    weekStart: string;
  }) {
    try {
      let query = supabase
        .from('weekly_payment_tracking')
        .select(`
          *,
          customer:customers(*),
          loan_application:loan_applications(
            *,
            loan_product:loan_products(*)
          )
        `)
        .eq('week_start', filters.weekStart);

      if (filters.agentId) {
        query = query.eq('agent_id', filters.agentId);
      }
      if (filters.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }

      const { data, error } = await query.order('customer_id');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get weekly payment tracking error:', error);
      throw error;
    }
  }

  async createTransaction(transactionData: {
    loan_application_id?: string;
    customer_id: string;
    agent_id: string;
    branch_id: string;
    transaction_type: 'loan_disbursement' | 'daily_payment' | 'penalty' | 'refund';
    amount: number;
    payment_method?: string;
    reference_number?: string;
    description?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          reference_number: transactionData.reference_number || `TXN-${Date.now()}`
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  }

  async getTransactions(filters?: {
    branchId?: string;
    agentId?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          customer:customers(*),
          agent:users(*),
          branch:branches(*),
          loan_application:loan_applications(*)
        `);

      if (filters?.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }
      if (filters?.agentId) {
        query = query.eq('agent_id', filters.agentId);
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
