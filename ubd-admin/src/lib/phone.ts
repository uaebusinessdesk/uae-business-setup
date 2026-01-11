/**
 * Phone number utility functions
 * Normalization and validation for E.164 format
 */

// E.164 phone validation regex: must start with +, then 8-15 digits
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

/**
 * Normalize phone number
 * - Trims whitespace
 * - Removes internal spaces
 * - Converts "00" prefix to "+"
 * 
 * @param input - Phone number string
 * @returns Normalized phone number string
 * 
 * @example
 * normalizePhone("+971 50 123 4567") // "+971501234567"
 * normalizePhone("00971501234567") // "+971501234567"
 * normalizePhone("  +971501234567  ") // "+971501234567"
 */
export function normalizePhone(input: string): string {
  // Trim whitespace
  let normalized = input.trim();
  
  // Remove internal spaces
  normalized = normalized.replace(/\s+/g, '');
  
  // If starts with "00", replace with "+"
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.substring(2);
  }
  
  return normalized;
}

/**
 * Validate E.164 phone format
 * - Must start with "+"
 * - First digit after "+" must be 1-9 (not 0)
 * - Total length: 8-15 digits after "+"
 * 
 * @param phone - Phone number to validate
 * @returns true if valid E.164 format
 * 
 * @example
 * isValidE164("+971501234567") // true
 * isValidE164("971501234567") // false (missing +)
 * isValidE164("+0559053330") // false (starts with 0)
 */
export function isValidE164(phone: string): boolean {
  return E164_REGEX.test(phone.trim());
}




