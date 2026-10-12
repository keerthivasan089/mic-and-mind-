import { supabase } from '../lib/supabase';

export interface AdminProfile {
  id: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

/**
 * Verify that the authenticated user exists in public.profiles and has role === 'admin'.
 * Uses ONLY the profile ID/user ID relationship against public.profiles (select('role')).
 */
export async function verifyAdminProfile(
  userId: string,
  userEmail?: string
): Promise<{ authorized: boolean; user?: AdminUser; error?: string }> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return {
        authorized: false,
        error: error?.message || 'Admin profile not found. Please ensure your account has an admin profile in the database.',
      };
    }

    // Role check: Only role === 'admin' is granted access
    if (profile.role !== 'admin') {
      return {
        authorized: false,
        error: 'Access Denied: Your account does not have administrator privileges.',
      };
    }

    const email = userEmail || '';
    const name = email
      ? email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      : 'Administrator';

    const adminUser: AdminUser = {
      id: userId,
      name: name || 'Admin',
      email: email,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email || 'Admin')}`,
      role: 'Master Admin',
    };

    return { authorized: true, user: adminUser };
  } catch (err: any) {
    return {
      authorized: false,
      error: err?.message || 'Unexpected error validating administrator profile.',
    };
  }
}

/**
 * Real Supabase Email + Password Login for Admin Portal.
 */
export async function loginAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message || 'Invalid email or password. Please verify your Supabase credentials.',
      };
    }

    // Check admin authorization in public.profiles table using returned authenticated user ID
    const check = await verifyAdminProfile(data.user.id, data.user.email);
    if (!check.authorized || !check.user) {
      // Immediately sign out unauthorized user from Supabase session
      await supabase.auth.signOut();
      return {
        success: false,
        error: check.error || 'Access Denied: Your account does not have administrator privileges.',
      };
    }

    return { success: true, user: check.user };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred during authentication.',
    };
  }
}

/**
 * Restores and validates existing Supabase session on page load / reload.
 */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return null;
    }

    const check = await verifyAdminProfile(session.user.id, session.user.email);
    if (check.authorized && check.user) {
      return check.user;
    }

    // Unauthorized session: purge session
    await supabase.auth.signOut();
    return null;
  } catch {
    return null;
  }
}

/**
 * Sign out from Supabase Auth session.
 */
export async function logoutAdmin(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Error signing out from Supabase Auth:', err);
  }
}

/**
 * Trigger Supabase Auth password reset email.
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send reset email.' };
  }
}
