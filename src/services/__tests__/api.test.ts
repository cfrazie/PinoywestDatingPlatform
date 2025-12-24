import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables before any imports
vi.stubGlobal('import.meta', {
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-key',
    DEV: true
  }
});

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null }))
        }))
      }))
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ 
        data: { session: null },
        error: null 
      }))
    }
  }
}));

import { submitContactForm, subscribeToNewsletter } from '../api';

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitContactForm', () => {
    it('submits contact form successfully', async () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message'
      };

      const result = await submitContactForm(formData);
      expect(result.message).toBeDefined();
      expect(result.error).toBeUndefined();
    });
  });

  describe('subscribeToNewsletter', () => {
    it('subscribes to newsletter successfully', async () => {
      const newsletterData = {
        email: 'test@example.com'
      };

      const result = await subscribeToNewsletter(newsletterData);
      expect(result.message).toBeDefined();
      expect(result.error).toBeUndefined();
    });
  });
});