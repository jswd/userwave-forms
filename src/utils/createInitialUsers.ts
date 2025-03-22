
import { supabase } from '@/lib/supabase';

// Function to create an admin user
export async function createAdminUser() {
  try {
    // Check if admin user already exists
    const { data: existingAdmins } = await supabase
      .from('users')
      .select('email')
      .eq('email', 'admin@example.com')
      .single();
    
    if (existingAdmins) {
      console.log('Admin user already exists');
      return { success: true, message: 'Admin user already exists' };
    }

    // Create the admin user in Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@example.com',
      password: 'admin123',
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      }
    });

    if (authError) {
      if (authError.message.includes('rate limit')) {
        return { 
          success: false, 
          message: 'Email rate limit exceeded. Please try again later or use a different email address.' 
        };
      }
      throw authError;
    }

    if (authData.user) {
      // Create the admin user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: 'admin@example.com',
          role: 'admin',
          full_name: 'Admin User',
          created_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;
      console.log('Admin user created successfully');
      return { success: true, message: 'Admin user created successfully' };
    }
    
    return { success: false, message: 'Failed to create admin user' };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { 
      success: false, 
      message: `Error creating admin user: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

// Function to create a client user
export async function createClientUser() {
  try {
    // Check if client user already exists
    const { data: existingClients } = await supabase
      .from('users')
      .select('email')
      .eq('email', 'client@example.com')
      .single();
    
    if (existingClients) {
      console.log('Client user already exists');
      return { success: true, message: 'Client user already exists' };
    }

    // Create the client user in Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'client@example.com',
      password: 'client123',
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      }
    });

    if (authError) {
      if (authError.message.includes('rate limit')) {
        return { 
          success: false, 
          message: 'Email rate limit exceeded. Please try again later or use a different email address.' 
        };
      }
      throw authError;
    }

    if (authData.user) {
      // Create the client user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: 'client@example.com',
          role: 'user',
          full_name: 'Client User',
          created_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;
      console.log('Client user created successfully');
      return { success: true, message: 'Client user created successfully' };
    }
    
    return { success: false, message: 'Failed to create client user' };
  } catch (error) {
    console.error('Error creating client user:', error);
    return { 
      success: false, 
      message: `Error creating client user: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

// Create both users
export async function createInitialUsers() {
  const adminResult = await createAdminUser();
  const clientResult = await createClientUser();
  
  if (!adminResult.success || !clientResult.success) {
    return { 
      success: false, 
      message: adminResult.success ? clientResult.message : adminResult.message 
    };
  }
  
  return { 
    success: true, 
    message: 'Users created successfully' 
  };
}
