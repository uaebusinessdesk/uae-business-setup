'use client';

import { useEffect } from 'react';

export default function StylesheetLoader() {
  useEffect(() => {
    // Check if stylesheet is already loaded
    const existingLink = document.querySelector('link[href="/assets/styles.css"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/assets/styles.css';
      document.head.appendChild(link);
    }
  }, []);

  return null;
}
