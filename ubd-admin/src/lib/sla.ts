import type { LeadActivity } from '@prisma/client';

// SLA thresholds (in hours)
export const RESPONSE_OVERDUE_HOURS = 48; // 2 days
export const COMPLETION_OVERDUE_HOURS = 336; // 14 days

export interface CompanySla {
  sentToAgentAt?: Date;
  feasibleAt?: Date;
  completedAt?: Date;
  responseHours?: number;
  completionHours?: number;
  responseElapsedHours?: number;   // if feasible missing
  completionElapsedHours?: number; // if completed missing
  isResponseOverdue: boolean;
  isCompletionOverdue: boolean;
}

export function computeCompanySla(activities: LeadActivity[]): CompanySla {
  const result: CompanySla = {
    isResponseOverdue: false,
    isCompletionOverdue: false,
  };

  // Sort activities by createdAt (oldest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Find sentToAgentAt (latest "company_sent_to_agent" or first if only one)
  const sentToAgentActivities = sortedActivities.filter(
    (a) => a.action === 'company_sent_to_agent'
  );
  if (sentToAgentActivities.length > 0) {
    // Use the latest one
    const latestSent = sentToAgentActivities[sentToAgentActivities.length - 1];
    result.sentToAgentAt = new Date(latestSent.createdAt);
  }

  // Find feasibleAt (first "company_feasible_confirmed" after sentToAgentAt)
  if (result.sentToAgentAt) {
    const feasibleActivity = sortedActivities.find(
      (a) =>
        a.action === 'company_feasible_confirmed' &&
        new Date(a.createdAt) >= result.sentToAgentAt!
    );
    if (feasibleActivity) {
      result.feasibleAt = new Date(feasibleActivity.createdAt);
    }
  }

  // Find completedAt (first "company_completed" after sentToAgentAt)
  if (result.sentToAgentAt) {
    const completedActivity = sortedActivities.find(
      (a) =>
        a.action === 'company_completed' &&
        new Date(a.createdAt) >= result.sentToAgentAt!
    );
    if (completedActivity) {
      result.completedAt = new Date(completedActivity.createdAt);
    }
  }

  // Calculate response time (sentToAgentAt to feasibleAt)
  if (result.sentToAgentAt && result.feasibleAt) {
    const diffMs = result.feasibleAt.getTime() - result.sentToAgentAt.getTime();
    result.responseHours = Math.round(diffMs / (1000 * 60 * 60));
  }

  // Calculate completion time (feasibleAt to completedAt)
  if (result.feasibleAt && result.completedAt) {
    const diffMs = result.completedAt.getTime() - result.feasibleAt.getTime();
    result.completionHours = Math.round(diffMs / (1000 * 60 * 60));
  }

  // Calculate response elapsed hours (if feasible missing)
  if (result.sentToAgentAt && !result.feasibleAt) {
    const now = new Date();
    const diffMs = now.getTime() - result.sentToAgentAt.getTime();
    result.responseElapsedHours = Math.round(diffMs / (1000 * 60 * 60));
    result.isResponseOverdue = result.responseElapsedHours > RESPONSE_OVERDUE_HOURS;
  }

  // Calculate completion elapsed hours (if completed missing)
  if (result.feasibleAt && !result.completedAt) {
    const now = new Date();
    const diffMs = now.getTime() - result.feasibleAt.getTime();
    result.completionElapsedHours = Math.round(diffMs / (1000 * 60 * 60));
    result.isCompletionOverdue = result.completionElapsedHours > COMPLETION_OVERDUE_HOURS;
  }

  return result;
}

