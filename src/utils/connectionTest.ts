
import { supabase } from '@/lib/supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase connection successful');
    return { success: true, data };
  } catch (error) {
    console.error('Supabase connection test exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const testAdminFunctions = async () => {
  try {
    console.log('Testing admin functions connection...');
    
    // Test admin functions endpoint
    const { data, error } = await supabase.functions.invoke('admin-functions', {
      body: { 
        action: 'test_connection',
        test: true
      }
    });
    
    if (error) {
      console.error('Admin functions test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Admin functions connection successful');
    return { success: true, data };
  } catch (error) {
    console.error('Admin functions test exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
