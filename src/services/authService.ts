import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'sub_admin' | 'agent';
  branchId?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: data.role,
            branchId: data.branchId
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create auth user');

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .maybeSingle();
      
      if (userError) {
        console.error("Error fetching user profile immediately after signup:", userError);
        throw new Error("Account created, but failed to fetch profile. Please try logging in.");
      }

      const finalUser = userData || { 
        id: '', auth_id: authData.user.id, email: data.email, ...data 
      };

      return { user: finalUser, authUser: authData.user };

    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signIn(data: SignInData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Your email address has not been confirmed. Please check your inbox for a verification link.');
        }
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to sign in. Please try again.');
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          branch:branches(*)
        `)
        .eq('auth_id', authData.user.id)
        .maybeSingle();

      if (userError) {
        console.error("Database error while fetching user profile:", userError);
        throw new Error("Could not fetch user profile. Please contact support.");
      }

      if (!userData) {
        console.error(`Profile not found for authenticated user: ${authData.user.id}`);
        await supabase.auth.signOut();
        throw new Error("Your user profile could not be found. Please sign up again or contact support.");
      }

      return { user: userData, authUser: authData.user };

    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) return null;

      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *,
          branch:branches(*)
        `)
        .eq('auth_id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error("Get current user profile error:", error);
        return null;
      }

      if (!userData) {
        console.warn(`No profile found for active session user: ${authUser.id}. The user might need to be signed out.`);
        return null;
      }

      return { user: userData, authUser };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async updateProfile(updates: Partial<User>) {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_id', authUser.id)
        .select()
        .maybeSingle();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
