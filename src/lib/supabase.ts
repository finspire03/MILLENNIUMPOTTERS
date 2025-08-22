import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Real-time subscriptions for live updates
export const subscribeToLoanUpdates = (callback: (payload: any) => void) => {
  return supabase
    .channel('loan_updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'loan_applications' }, 
      callback
    )
    .subscribe();
};

export const subscribeToPaymentUpdates = (callback: (payload: any) => void) => {
  return supabase
    .channel('payment_updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'daily_payments' }, 
      callback
    )
    .subscribe();
};

export const subscribeToTransactionUpdates = (callback: (payload: any) => void) => {
  return supabase
    .channel('transaction_updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'transactions' }, 
      callback
    )
    .subscribe();
};

// Database types
export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string;
          name: string;
          code: string;
          address: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          address?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          address?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          role: 'admin' | 'sub_admin' | 'agent';
          branch_id: string | null;
          is_active: boolean;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          auth_id?: string | null;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          role: 'admin' | 'sub_admin' | 'agent';
          branch_id?: string | null;
          is_active?: boolean;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          auth_id?: string | null;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          role?: 'admin' | 'sub_admin' | 'agent';
          branch_id?: string | null;
          is_active?: boolean;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
    };
  };
}
