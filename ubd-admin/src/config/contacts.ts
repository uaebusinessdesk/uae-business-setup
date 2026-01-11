/**
 * Agent Configuration
 * Active agents list for round-robin assignment
 * Ordered by priority (stable ordering)
 */
export const ACTIVE_AGENTS: string[] = ['athar', 'anoop', 'self'];

/**
 * Get default agent ID from environment variable
 * Falls back to null if not set
 * @deprecated Use getDefaultAgentId from '@/config/app' instead
 */
export function getDefaultAgentId(): string | null {
  return process.env.DEFAULT_AGENT_ID || null;
}

/**
 * Get internal notification phone numbers
 * Reads from INTERNAL_NOTIFY_NUMBERS env var (comma-separated)
 * Returns array in order: [Athar, Anoop, Admin]
 * 
 * @deprecated Use getInternalNotifyRecipients from '@/config/app' instead
 */
export function getInternalNotifyNumbers(): string[] {
  const envValue = process.env.INTERNAL_NOTIFY_NUMBERS;
  if (!envValue) {
    // Fallback for backward compatibility during migration
    const fallback = process.env.TEST_WHATSAPP || "+971504209110";
    return [fallback, fallback, fallback];
  }
  
  return envValue
    .split(',')
    .map(num => num.trim())
    .filter(num => num.length > 0);
}

/**
 * Get agent WhatsApp number by agent ID
 * Uses INTERNAL_NOTIFY_NUMBERS env var
 * Falls back to TEST_WHATSAPP if not configured
 */
export function getAgentWhatsAppNumber(agentId: string): string {
  const numbers = getInternalNotifyNumbers();
  
  // Map agent IDs to positions in the array
  const agentIndex: Record<string, number> = {
    'athar': 0,
    'anoop': 1,
    'self': 2,
  };
  
  const index = agentIndex[agentId] ?? 0;
  const number = numbers[index] || numbers[0] || process.env.TEST_WHATSAPP || "+971504209110";
  
  return number;
}

// Legacy exports for backward compatibility
// These will be removed in a future version
export const TEST_WHATSAPP = process.env.TEST_WHATSAPP || "+971504209110";
export const ATHAR_WHATSAPP = getAgentWhatsAppNumber('athar');
export const ANOOP_WHATSAPP = getAgentWhatsAppNumber('anoop');
export const SELF_WHATSAPP = getAgentWhatsAppNumber('self');

/**
 * Get agent WhatsApp number from database by agent ID
 * This is the preferred method for getting agent contact info
 * @param agentId - Agent ID from database
 * @returns WhatsApp number or null if agent not found
 */
export async function getAgentWhatsAppFromDb(agentId: string): Promise<string | null> {
  try {
    const { db } = await import('@/lib/db');
    const agent = await db.agent.findUnique({
      where: { id: agentId },
      select: { whatsappNumber: true },
    });
    return agent?.whatsappNumber || null;
  } catch (error) {
    console.error('Error fetching agent WhatsApp from database:', error);
    return null;
  }
}
