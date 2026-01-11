import { sendEmail, EmailOptions } from '@/lib/email';

/**
 * Send email to customer (NO CC - use notifications instead)
 * 
 * @param options - Email options (to, subject, html, from)
 * @param emailType - Type of email (e.g., "quote", "invoice", "welcome", "review", "reminder", "completion", "payment-confirmation")
 * @returns Promise that resolves when email is sent
 */
export async function sendCustomerEmail(
  options: Omit<EmailOptions, 'cc'>,
  emailType: string
): Promise<void> {
  // Send email without CC - notifications are sent separately via notifyAdmin
  await sendEmail(options);
}

