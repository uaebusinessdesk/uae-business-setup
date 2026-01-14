'use client';

import { useEffect } from 'react';

export default function StylesheetLoader() {
  useEffect(() => {
    // Function to load stylesheet synchronously
    const loadStylesheet = () => {
      // Check if stylesheet is already loaded
      const existingLink = document.querySelector('link[href="/assets/styles.css"]');
      if (existingLink) {
        return; // Already loaded
      }

      // Create and insert link tag
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/assets/styles.css';
      link.media = 'all';
      
      // Insert at the beginning of head for early loading
      if (document.head.firstChild) {
        document.head.insertBefore(link, document.head.firstChild);
      } else {
        document.head.appendChild(link);
      }
    };

    // Load immediately if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadStylesheet);
    } else {
      loadStylesheet();
    }

    // Cleanup
    return () => {
      document.removeEventListener('DOMContentLoaded', loadStylesheet);
    };
  }, []);

  return null;
}
