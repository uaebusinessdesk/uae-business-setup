'use client';

import { useEffect } from 'react';

/**
 * Global error suppression component to suppress Next.js router fetch errors
 * These errors occur during navigation/refresh and are expected behavior
 */
export default function ErrorSuppression() {
  useEffect(() => {
    // Suppress unhandled promise rejections from Next.js router
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
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
        return false;
      }
    };
    
    // Suppress console errors from Next.js router
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const errorString = args.join(' ');
      // Suppress Next.js router fetch errors
      if (
        errorString.includes('Failed to fetch') &&
        (errorString.includes('router-reducer') || 
         errorString.includes('fetch-server-response') ||
         errorString.includes('next/dist'))
      ) {
        // Silently suppress
        return;
      }
      // Call original console.error for other errors
      originalError.apply(console, args);
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalError;
    };
  }, []);

  return null;
}

