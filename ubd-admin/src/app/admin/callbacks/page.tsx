'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CallbackRequest {
  id: string;
  name: string | null;
  phone: string;
  createdAt: string;
  calledAt: string | null;
  notes: string | null;
}

export default function CallbacksPage() {
  const router = useRouter();
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [allCallbacks, setAllCallbacks] = useState<CallbackRequest[]>([]); // For counts
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'called'>('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [selectedCallbacks, setSelectedCallbacks] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchAllCallbacks = async () => {
    try {
      const response = await fetch('/api/callback/list');
      const data = await response.json();
      if (data.ok) {
        setAllCallbacks(data.callbacks);
      }
    } catch (error) {
      console.error('Failed to fetch all callbacks:', error);
    }
  };

  const fetchCallbacks = async () => {
    try {
      setLoading(true);
      const called = filter === 'all' ? null : filter === 'called' ? 'true' : 'false';
      const url = called ? `/api/callback/list?called=${called}` : '/api/callback/list';
      const response = await fetch(url);
      const data = await response.json();
      if (data.ok) {
        setCallbacks(data.callbacks);
      }
    } catch (error) {
      console.error('Failed to fetch callbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsCalled = async (id: string) => {
    try {
      setSaving({ ...saving, [id]: true });
      const response = await fetch(`/api/callback/${id}/mark-called`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes[id] || null }),
      });
      const data = await response.json();
      if (data.ok) {
        await fetchCallbacks();
        await fetchAllCallbacks(); // Refresh counts
        setNotes({ ...notes, [id]: '' });
      }
    } catch (error) {
      console.error('Failed to mark as called:', error);
    } finally {
      setSaving({ ...saving, [id]: false });
    }
  };

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchCallbacks();
    fetchAllCallbacks(); // Fetch all for counts
  }, [filter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      router.refresh();
      fetchCallbacks();
      fetchAllCallbacks();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [router, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleCallbackSelection = (callbackId: string) => {
    setSelectedCallbacks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(callbackId)) {
        newSet.delete(callbackId);
      } else {
        newSet.add(callbackId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCallbacks.size === callbacks.length) {
      setSelectedCallbacks(new Set());
    } else {
      setSelectedCallbacks(new Set(callbacks.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCallbacks.size === 0) {
      alert('Please select at least one callback to delete');
      return;
    }

    const count = selectedCallbacks.size;
    if (!confirm(`Are you sure you want to delete ${count} callback${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBulkDeleting(true);
    try {
      const response = await fetch('/api/callback/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callbackIds: Array.from(selectedCallbacks),
        }),
      });

      const data = await response.json();
      if (data.ok) {
        alert(`Successfully deleted ${data.deletedCount} callback${data.deletedCount > 1 ? 's' : ''}`);
        setSelectedCallbacks(new Set());
        await fetchCallbacks();
        await fetchAllCallbacks(); // Refresh counts
      } else {
        alert(`Failed to delete callbacks: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error bulk deleting callbacks:', error);
      alert('Failed to delete callbacks');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Calculate counts from all callbacks, not filtered ones
  const pendingCallbacks = allCallbacks.filter(c => !c.calledAt);
  const calledCallbacks = allCallbacks.filter(c => c.calledAt);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
          <h1 className="text-3xl font-bold text-gray-900">Callback Requests</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              filter === 'pending'
                ? 'bg-indigo-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending ({pendingCallbacks.length})
          </button>
          <button
            onClick={() => setFilter('called')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              filter === 'called'
                ? 'bg-indigo-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Called ({calledCallbacks.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading callbacks...</p>
        </div>
      ) : callbacks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 font-medium">No callback requests found.</p>
        </div>
      ) : (
        <>
          {/* Bulk Actions Bar */}
          {selectedCallbacks.size > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6 flex items-center justify-between shadow-sm">
              <span className="text-base font-semibold text-indigo-900">
                {selectedCallbacks.size} callback{selectedCallbacks.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
              >
                {bulkDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete {selectedCallbacks.size} Callback{selectedCallbacks.size > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}

          <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedCallbacks.size === callbacks.length && callbacks.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {callbacks.map((callback) => (
                  <tr key={callback.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCallbacks.has(callback.id)}
                        onChange={() => toggleCallbackSelection(callback.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {callback.name || 'No name'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://wa.me/${callback.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                      >
                        {callback.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(callback.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {callback.calledAt ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Called
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {!callback.calledAt ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Notes (optional)"
                            value={notes[callback.id] || ''}
                            onChange={(e) => setNotes({ ...notes, [callback.id]: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-48"
                          />
                          <button
                            onClick={() => markAsCalled(callback.id)}
                            disabled={saving[callback.id]}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-sm font-semibold rounded-lg hover:from-amber-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            {saving[callback.id] ? (
                              <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              'Mark as Called'
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          <div>Called: {formatDate(callback.calledAt)}</div>
                          {callback.notes && (
                            <div className="mt-1 text-xs text-gray-500 italic">
                              {callback.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

