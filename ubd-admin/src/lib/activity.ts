import { db } from './db';

export async function logActivity(
  leadId: string,
  action: string,
  message?: string
): Promise<void> {
  try {
    await db.leadActivity.create({
      data: {
        leadId,
        action,
        message: message || null,
      },
    });
  } catch (error) {
    // Log error but don't throw - activity logging should not break the main flow
    console.error('Failed to log activity:', error);
  }
}


