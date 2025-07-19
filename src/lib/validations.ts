import { z } from 'zod';
import { sanitizeInput } from './security';

// Enhanced validation with security checks
const secureString = (min: number, max: number) => 
  z.string()
    .min(min)
    .max(max)
    .transform(sanitizeInput)
    .refine(
      (val) => !/<script|javascript:|vbscript:|onload|onerror/i.test(val),
      'Invalid characters detected'
    );

const secureEmail = z.string()
  .email('Please enter a valid email address')
  .max(254)
  .transform(sanitizeInput)
  .refine(
    (val) => !/<script|javascript:|vbscript:/i.test(val),
    'Invalid email format'
  );

export const contactFormSchema = z.object({
  name: secureString(2, 100).refine(
    (val) => val.trim().length >= 2,
    'Name must be at least 2 characters'
  ),
  email: secureEmail,
  subject: secureString(5, 200).refine(
    (val) => val.trim().length >= 5,
    'Subject must be at least 5 characters'
  ),
  message: secureString(10, 1000).refine(
    (val) => val.trim().length >= 10,
    'Message must be at least 10 characters'
  ),
});

export const newsletterSchema = z.object({
  email: secureEmail,
});

export const waitlistSchema = z.object({
  email: secureEmail,
  name: secureString(2, 100).refine(
    (val) => val.trim().length >= 2,
    'Name must be at least 2 characters'
  ),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type NewsletterData = z.infer<typeof newsletterSchema>;
export type WaitlistData = z.infer<typeof waitlistSchema>;