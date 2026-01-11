/**
 * Secure token utilities for invoice view links
 * Similar to quote approval tokens, but for invoice viewing
 */

import { SignJWT, jwtVerify } from 'jose';

// Get JWT secret with production validation
// Precedence: QUOTE_APPROVAL_SECRET || JWT_SECRET (same as quote tokens)
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
    if (!(global as any).__invoiceSecretWarningLogged) {
      console.warn('[Invoice Token] Using default invoice secret in dev. Set QUOTE_APPROVAL_SECRET or JWT_SECRET for production.');
      (global as any).__invoiceSecretWarningLogged = true;
    }
    return defaultSecret;
  }
  
  return secret;
};

const SECRET_KEY = getSecretKey();
const ALGORITHM = 'HS256';

/**
 * Create a secure token for invoice view links
 * @param leadId - The lead ID to generate token for
 * @param version - Optional invoice version (if not provided, shows latest)
 * @param project - Optional project type ('company', 'bank', or 'bank-deal', defaults to 'company')
 * @returns JWT token string
 */
export async function createInvoiceToken({ leadId, version, project }: { leadId: string; version?: number; project?: 'company' | 'bank' | 'bank-deal' }): Promise<string> {
  const secret = new TextEncoder().encode(SECRET_KEY);
  
  const payload: any = {
    leadId,
    action: 'view_invoice',
    project: project || 'company',
  };
  if (version !== undefined) {
    payload.version = version;
  }
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  return token;
}

/**
 * Verify and decode an invoice view token
 * @param token - The JWT token to verify
 * @returns Decoded payload with leadId, optional version, and project
 * @throws Error if token is invalid, expired, or missing required fields
 */
export async function verifyInvoiceToken(token: string): Promise<{ leadId: string; version?: number; project: 'company' | 'bank' | 'bank-deal' }> {
  try {
    const secret = new TextEncoder().encode(SECRET_KEY);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
    });

    // Validate required fields
    if (!payload.leadId || typeof payload.leadId !== 'string') {
      throw new Error('Token missing leadId');
    }
    if (payload.action !== 'view_invoice') {
      throw new Error('Invalid token action');
    }

    const projectValue = payload.project as string;
    const project = (projectValue === 'bank' || projectValue === 'bank-deal') 
      ? (projectValue === 'bank-deal' ? 'bank-deal' : 'bank')
      : 'company';
    
    return {
      leadId: payload.leadId as string,
      version: payload.version !== undefined ? Number(payload.version) : undefined,
      project: project as 'company' | 'bank' | 'bank-deal',
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        throw new Error('Invoice token has expired');
      }
      throw new Error(`Invalid invoice token: ${error.message}`);
    }
    throw new Error('Failed to verify invoice token');
  }
}

