/**
 * Application Configuration
 * Reads from environment variables with sensible defaults
 */

/**
 * Brand name for the application
 * Default: "UAE Business Desk"
 */
export function getBrandName(): string {
  return process.env.BRAND_NAME || 'UAE Business Desk';
}

/**
 * Default agent ID for lead assignment
 * Optional - if not set, round-robin will be used
 */
export function getDefaultAgentId(): string | null {
  return process.env.DEFAULT_AGENT_ID || null;
}

/**
 * Internal notification phone numbers
 * Format: comma-separated list of phone numbers
 * Example: "+971501234567,+971509876543,+971504209110"
 * 
 * Returns array of phone numbers (deduplicated, preserving order), or empty array if not configured
 */
export function getInternalNotifyNumbers(): string[] {
  const envValue = process.env.INTERNAL_NOTIFY_NUMBERS;
  if (!envValue) {
    return [];
  }
  
  // Split by comma and clean up whitespace
  const numbers = envValue
    .split(',')
    .map(num => num.trim())
    .filter(num => num.length > 0);
  
  // Deduplicate while preserving order
  const seen = new Set<string>();
  const unique: string[] = [];
  const duplicates: string[] = [];
  
  for (const num of numbers) {
    if (!seen.has(num)) {
      seen.add(num);
      unique.push(num);
    } else {
      duplicates.push(num);
    }
  }
  
  // Log deduplication in development only
  if (duplicates.length > 0 && process.env.NODE_ENV !== 'production') {
    console.log(`[Config] Deduplicated ${duplicates.length} duplicate phone number(s) from INTERNAL_NOTIFY_NUMBERS:`, duplicates);
    console.log(`[Config] Unique recipients (${unique.length}):`, unique);
  }
  
  return unique;
}

/**
 * Get internal notification numbers with names
 * For now, all notifications go to +971504209110 (Admin)
 * TODO: Update when agent phone numbers are available
 */
export function getInternalNotifyRecipients(): Array<{ name: string; number: string }> {
  // For now, use single number for all internal notifications
  // TODO: Update when agent phone numbers are available
  return [{ name: 'Admin', number: '+971504209110' }];
}

/**
 * Validate configuration on app startup
 * Logs warnings for missing optional config, errors for critical issues
 */
export function validateConfig(): void {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check brand name (has default, so no validation needed)
  const brandName = getBrandName();
  if (!brandName || brandName.trim().length === 0) {
    errors.push('BRAND_NAME cannot be empty');
  }

  // Check internal notify numbers (optional but recommended)
  const notifyNumbers = getInternalNotifyNumbers();
  if (notifyNumbers.length === 0) {
    warnings.push('INTERNAL_NOTIFY_NUMBERS not configured - internal notifications will not work');
  } else {
    // Validate phone number format (basic check)
    const invalidNumbers = notifyNumbers.filter(num => {
      // Basic validation: should start with + and contain only digits after +
      return !/^\+[1-9]\d{6,14}$/.test(num);
    });
    
    if (invalidNumbers.length > 0) {
      errors.push(`Invalid phone number format in INTERNAL_NOTIFY_NUMBERS: ${invalidNumbers.join(', ')}. Expected format: +[country code][number]`);
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('[Config] Warnings:');
    warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`));
  }

  // Log errors
  if (errors.length > 0) {
    console.error('[Config] Errors:');
    errors.forEach(error => console.error(`  ❌ ${error}`));
    throw new Error('Configuration validation failed. Please check your environment variables.');
  }

  // Log successful configuration
  if (warnings.length === 0 && errors.length === 0) {
    console.log('[Config] ✅ Configuration validated successfully');
    console.log(`[Config]   Brand: ${brandName}`);
    console.log(`[Config]   Default Agent: ${getDefaultAgentId() || 'Not set (using round-robin)'}`);
    console.log(`[Config]   Internal Notify Numbers: ${notifyNumbers.length} configured`);
  }
}

