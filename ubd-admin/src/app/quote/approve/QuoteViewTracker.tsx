'use client';

import { useEffect, useRef } from 'react';

interface QuoteViewTrackerProps {
  token: string;
}

/**
 * Client component to track when quote decision page is viewed
 * Calls /api/quote/view once on mount
 */
export default function QuoteViewTracker({ token }: QuoteViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once
    if (hasTracked.current || !token) return;
    hasTracked.current = true;

    // Call API to track view (non-blocking)
    fetch('/api/quote/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).catch((error) => {
      // Silently fail - don't block rendering or show errors to user
      console.error('[QuoteViewTracker] Failed to track view:', error);
    });
  }, [token]);

  // This component renders nothing
  return null;
}




