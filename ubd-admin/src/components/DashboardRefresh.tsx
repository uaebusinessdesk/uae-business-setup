'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * DashboardRefresh component - Auto-refresh with error suppression
 * Refreshes the page data every 30 seconds (default) to keep data up-to-date.
 * Errors from Next.js router refresh are suppressed to prevent console noise.
 */
export default function DashboardRefresh({ interval = 30000 }: { interval?: number }) {
  const router = useRouter();
  const isMountedRef = useRef(true);
  const isRefreshingRef = useRef(false);
  const errorCountRef = useRef(0);
  const rejectionHandlerRef = useRef<((event: PromiseRejectionEvent) => void) | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    errorCountRef.current = 0;
    
    // Suppress Next.js router fetch errors from unhandled promise rejections
    rejectionHandlerRef.current = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const errorMessage = reason?.message || String(reason) || '';
      const errorStack = reason?.stack || '';
      
      // Suppress "Failed to fetch" errors from Next.js router refresh
      if (
        (errorMessage.includes('Failed to fetch') || 
         errorMessage.includes('fetch') ||
         errorStack.includes('router-reducer') ||
         errorStack.includes('fetch-server-response') ||
         errorStack.includes('next/dist') ||
         errorStack.includes('ppr-navigations'))
      ) {
        event.preventDefault();
        // Silently handle - these are expected during navigation/refresh
        errorCountRef.current += 1;
        return;
      }
    };
    
    // Add unhandled rejection handler to suppress router fetch errors
    window.addEventListener('unhandledrejection', rejectionHandlerRef.current);
    
    // Handle visibility change - only refresh when page is visible
    const handleVisibilityChange = () => {
      // Reset error count when page becomes visible again
      if (!document.hidden) {
        errorCountRef.current = 0;
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const refreshInterval = setInterval(() => {
      // Skip refresh if:
      // - Component is unmounted
      // - Already refreshing
      // - Too many consecutive errors (disable after 3 errors)
      // - Page is hidden/not visible
      // - Browser is offline
      if (
        !isMountedRef.current || 
        isRefreshingRef.current || 
        errorCountRef.current >= 3 ||
        document.hidden ||
        (typeof navigator !== 'undefined' && !navigator.onLine)
      ) {
        return;
      }

      isRefreshingRef.current = true;
      
      // Wrap in try-catch to handle synchronous errors
      try {
        router.refresh();
      } catch (error) {
        // Increment error count for synchronous errors
        errorCountRef.current += 1;
      } finally {
        // Reset the refreshing flag after a delay
        setTimeout(() => {
          isRefreshingRef.current = false;
        }, 2000);
      }
    }, interval);

    return () => {
      isMountedRef.current = false;
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (rejectionHandlerRef.current) {
        window.removeEventListener('unhandledrejection', rejectionHandlerRef.current);
      }
    };
  }, [router, interval]);

  return null;
}

