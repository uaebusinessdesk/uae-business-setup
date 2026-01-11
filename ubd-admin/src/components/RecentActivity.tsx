'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'new_lead' | 'status_change' | 'payment' | 'quote_sent' | 'invoice_sent';
  leadId: string;
  leadName: string;
  description: string;
  timestamp: Date;
}

interface RecentActivityProps {
  activities: Activity[];
  maxItems?: number;
}

export default function RecentActivity({
  activities,
  maxItems = 10,
}: RecentActivityProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'new_lead':
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        );
      case 'status_change':
        return (
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        );
      case 'payment':
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'quote_sent':
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case 'invoice_sent':
        return (
          <svg
            className="w-5 h-5 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'new_lead':
        return 'bg-blue-100';
      case 'status_change':
        return 'bg-purple-100';
      case 'payment':
        return 'bg-green-100';
      case 'quote_sent':
        return 'bg-yellow-100';
      case 'invoice_sent':
        return 'bg-indigo-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <p className="text-gray-500 text-center py-8">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Link
          href="/admin/leads"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View All →
        </Link>
      </div>
      <div className="space-y-3">
        {activities.slice(0, maxItems).map((activity) => (
          <Link
            key={activity.id}
            href={`/admin/leads/${activity.leadId}`}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div
              className={`p-2 rounded-lg ${getActivityColor(activity.type)} flex-shrink-0`}
            >
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                {activity.leadName}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {activity.description}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

