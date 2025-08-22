import { supabase } from '../lib/supabase';

export interface Customer {
  id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  address: string;
  occupation?: string;
  monthly_income?: number;
  bank_name?: string;
  bank_account?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  branch_id: string;
  agent_id: string;
  is_active?: boolean;
}

export interface Guarantor {
  id?: string;
  customer_id?: string;
  type: 'primary' | 'secondary';
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  occupation?: string;
  monthly_income?: number;
  relationship_to_customer?: string;
}

class CustomerService {
  async createCustomer(customerData: Customer, guarantors: Guarantor[] = []) {
    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert(customerData)
        .select(`
          *,
          agent:users(*),
          branch:branches(*)
        `)
        .maybeSingle();

      if (customerError) throw customerError;
      if (!customer) throw new Error("Failed to create customer record.");

      if (guarantors.length > 0) {
        const guarantorData = guarantors.map(g => ({
          ...g,
          customer_id: customer.id
        }));

        const { error: guarantorError } = await supabase
          .from('guarantors')
          .insert(guarantorData);

        if (guarantorError) throw guarantorError;
      }

      return customer;
    } catch (error) {
      console.error('Create customer error:', error);
      throw error;
    }
  }

  async getCustomers(filters?: {
    branchId?: string;
    agentId?: string;
    isActive?: boolean;
  }) {
    try {
      let query = supabase
        .from('customers')
        .select(`
          *,
          agent:users(*),
          branch:branches(*),
          guarantors(*),
          loan_applications(
            *,
            loan_product:loan_products(*)
          )
        `);

      if (filters?.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }
      if (filters?.agentId) {
        query = query.eq('agent_id', filters.agentId);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get customers error:', error);
      throw error;
    }
  }

  async getCustomerById(customerId: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          agent:users(*),
          branch:branches(*),
          guarantors(*),
          loan_applications(
            *,
            loan_product:loan_products(*)
          )
        `)
        .eq('id', customerId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get customer by ID error:', error);
      throw error;
    }
  }

  async updateCustomer(customerId: string, updates: Partial<Customer>) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', customerId)
        .select(`
          *,
          agent:users(*),
          branch:branches(*)
        `)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update customer error:', error);
      throw error;
    }
  }

  async deleteCustomer(customerId: string) {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Delete customer error:', error);
      throw error;
    }
  }

  async getGuarantors(customerId: string) {
    try {
      const { data, error } = await supabase
        .from('guarantors')
        .select('*')
        .eq('customer_id', customerId)
        .order('type');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get guarantors error:', error);
      throw error;
    }
  }

  async addGuarantor(guarantorData: Guarantor) {
    try {
      const { data, error } = await supabase
        .from('guarantors')
        .insert(guarantorData)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add guarantor error:', error);
      throw error;
    }
  }
}

export const customerService = new CustomerService();
