'use client';

import { useState, useEffect } from 'react';

interface ServiceType {
  id: string;
  name: string;
  slug: string;
}

interface Agent {
  id: string;
  name: string;
  organizationName: string;
  whatsappNumber: string;
  email?: string | null;
  isActive: boolean;
  services?: {
    serviceType: ServiceType;
  }[];
}

interface AgentFormProps {
  agent?: Agent | null;
  onSave: (agent: Partial<Agent> & { serviceIds: string[] }) => Promise<void>;
  onCancel: () => void;
}

export default function AgentForm({ agent, onSave, onCancel }: AgentFormProps) {
  const [name, setName] = useState(agent?.name || '');
  const [organizationName, setOrganizationName] = useState(agent?.organizationName || '');
  const [whatsappNumber, setWhatsappNumber] = useState(agent?.whatsappNumber || '');
  const [email, setEmail] = useState(agent?.email || '');
  const [selectedServices, setSelectedServices] = useState<string[]>(
    agent?.services?.map(s => s.serviceType.id) || []
  );
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!organizationName.trim()) {
      setError('Organization name is required');
      return;
    }

    if (!whatsappNumber.trim()) {
      setError('WhatsApp number is required');
      return;
    }

    // Basic WhatsApp number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(whatsappNumber.replace(/\s/g, ''))) {
      setError('Please enter a valid WhatsApp number');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        organizationName: organizationName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim() || null,
        serviceIds: selectedServices,
        isActive: agent?.isActive ?? true,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save agent');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Agent Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name *
        </label>
        <input
          type="text"
          id="organizationName"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="Company or Bank Name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
          WhatsApp Number *
        </label>
        <input
          type="text"
          id="whatsapp"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="+971559053330"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="agent@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services *
        </label>
        <div className="space-y-2 border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto">
          {services.length === 0 ? (
            <p className="text-gray-500 text-sm">Loading services...</p>
          ) : (
            services.map((service) => (
              <label key={service.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{service.name}</span>
              </label>
            ))
          )}
        </div>
        {selectedServices.length === 0 && (
          <p className="text-red-500 text-xs mt-1">At least one service must be selected</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || selectedServices.length === 0}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : agent ? 'Update Agent' : 'Create Agent'}
        </button>
      </div>
    </form>
  );
}

