'use client';

import { useEffect } from 'react';

export default function StylesheetLoader() {
  useEffect(() => {
    // Function to load stylesheet
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
      
      // Use onload to ensure it's loaded
      link.onload = () => {
        // Stylesheet loaded successfully
      };
      
      link.onerror = () => {
        console.error('Failed to load styles.css');
      };
      
      // Insert at the beginning of head for early loading
      if (document.head.firstChild) {
        document.head.insertBefore(link, document.head.firstChild);
      } else {
        document.head.appendChild(link);
      }
    };

    // Load immediately
    loadStylesheet();
  }, []);

  return null;
}
