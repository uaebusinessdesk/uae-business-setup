'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LeadForm from '@/components/LeadForm';

export default function NewFreezoneLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData: any) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          setupType: 'freezone',
        }),
      });

      if (response.ok) {
        const lead = await response.json();
        router.push(`/admin/leads/${lead.id}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create lead');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f3]">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Link 
            href="/admin/leads/new" 
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Service Selection
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-10 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
              <h1 className="text-3xl font-bold text-gray-900">Create Free Zone Company Lead</h1>
            </div>
            <p className="text-sm text-gray-500 ml-4">Add a new lead for free zone company setup</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <LeadForm
            onSubmit={handleSubmit}
            loading={loading}
            serviceType="freezone"
            serviceLabel="Free Zone Company Setup"
          />
        </div>
      </div>
    </div>
  );
}

