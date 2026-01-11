/**
 * Token utilities for quote approval links
 * Uses JWT to create secure, time-limited approval tokens
 */

import { SignJWT, jwtVerify } from 'jose';

// Get JWT secret with production validation
// In production, we must have a secure secret (not the default)
// Precedence: QUOTE_APPROVAL_SECRET || JWT_SECRET
const getSecretKey = (): string => {
  const isProduction = process.env.NODE_ENV === 'production';
  const secret = process.env.QUOTE_APPROVAL_SECRET || process.env.JWT_SECRET;
  const defaultSecret = 'default-secret-change-in-production';
  
  // In production, enforce secure secret
  if (isProduction) {
    if (!secret || secret === defaultSecret) {
      throw new Error(
        'QUOTE_APPROVAL_SECRET or JWT_SECRET must be set to a secure value in production. ' +
        'The default secret is not allowed. Please set a strong, random secret in your environment variables.'
      );
    }
  }
  
  // In development, allow fallback to default with warning
  if (!secret) {
    // Log warning once (using a module-level flag to prevent spam)
    if (!(global as any).__quoteSecretWarningLogged) {
      console.warn('[Quote Approval Token] Using default quote secret in dev. Set QUOTE_APPROVAL_SECRET or JWT_SECRET for production.');
      (global as any).__quoteSecretWarningLogged = true;
    }
    return defaultSecret;
  }
  
  return secret;
};

const SECRET_KEY = getSecretKey();
const ALGORITHM = 'HS256';

/**
 * Create a signed approval token for a lead
 * @param leadId - Lead ID
 * @param leadType - 'Lead'
 * @param project - 'company', 'bank', or 'bank-deal' (default: 'company')
 * @param expiresIn - Token expiration time (default: 30 days)
 * @returns Signed JWT token
 */
export async function createApprovalToken(
  leadId: string,
  leadType: 'Lead',
  project: 'company' | 'bank' | 'bank-deal' = 'company',
  expiresIn: string = '30d'
): Promise<string> {
  const secret = new TextEncoder().encode(SECRET_KEY);
  
  const token = await new SignJWT({
    leadId,
    leadType,
    action: 'approve_quote',
    project,
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
}

/**
 * Verify and decode an approval token
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export async function verifyApprovalToken(token: string): Promise<{
  leadId: string;
  leadType: 'Lead';
  action: string;
  project: 'company' | 'bank' | 'bank-deal';
} | null> {
  try {
    const secret = new TextEncoder().encode(SECRET_KEY);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
    });

    if (payload.action !== 'approve_quote') {
      return null;
    }

    // Backward compatibility: default to 'company' if project not present
    const projectValue = payload.project as string;
    const project = (projectValue === 'bank' || projectValue === 'bank-deal')
      ? (projectValue === 'bank-deal' ? 'bank-deal' : 'bank')
      : 'company';

    return {
      leadId: payload.leadId as string,
      leadType: payload.leadType as 'Lead',
      action: payload.action as string,
      project: project as 'company' | 'bank' | 'bank-deal',
    };
  } catch (error) {
    console.error('[Quote Approval Token] Verification failed:', error);
    return null;
  }
}

