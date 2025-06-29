import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitContactForm, subscribeToNewsletter } from '../api';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null }))
        }))
      }))
    }))
  }
}));

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