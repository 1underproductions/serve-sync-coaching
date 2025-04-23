
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWaitlistData } from './useWaitlistData';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useWaitlistData', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useWaitlistData());
    
    expect(result.current.waitlistSignups).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.refreshing).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.debugInfo).toBe(null);
  });

  it('should fetch waitlist data on mount', async () => {
    const mockData = [{ id: '1', email: 'test@example.com', full_name: 'Test User', created_at: new Date().toISOString(), years_experience: 5, message: 'Test', status: 'pending' }];
    
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
      }))
    }));
    
    (supabase.from as any).mockImplementation(mockFrom);

    const { result, rerender } = renderHook(() => useWaitlistData());
    
    await act(async () => {
      await result.current.fetchWaitlist();
    });
    
    rerender();
    
    expect(supabase.from).toHaveBeenCalledWith('waitlist_signups');
    expect(result.current.waitlistSignups).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle refresh correctly', async () => {
    const { result } = renderHook(() => useWaitlistData());
    
    await act(async () => {
      result.current.handleRefresh();
    });
    
    expect(result.current.refreshing).toBe(false);
  });

  // Additional test cases for error handling would go here
});
