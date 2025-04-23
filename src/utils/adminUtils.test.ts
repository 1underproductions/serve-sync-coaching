
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { confirmAdminEmail } from './adminUtils';
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  }
}));

describe('adminUtils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('confirmAdminEmail', () => {
    it('should return true when admin email is confirmed successfully', async () => {
      // Set up mock return value
      (supabase.rpc as any).mockResolvedValue({
        data: true,
        error: null
      });

      const result = await confirmAdminEmail('admin@example.com');
      
      expect(supabase.rpc).toHaveBeenCalledWith(
        'admin_confirm_email',
        { admin_email: 'admin@example.com' }
      );
      expect(result).toBe(true);
    });

    it('should return false when there is an error', async () => {
      // Set up mock return value with error
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: { message: 'Error confirming email' }
      });

      const result = await confirmAdminEmail('admin@example.com');
      
      expect(result).toBe(false);
    });

    it('should return false when an exception occurs', async () => {
      // Set up mock to throw exception
      (supabase.rpc as any).mockRejectedValue(new Error('Network error'));

      const result = await confirmAdminEmail('admin@example.com');
      
      expect(result).toBe(false);
    });
  });
});
