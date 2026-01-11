'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LeadFormProps {
  onSubmit: (formData: any) => void;
  loading: boolean;
  serviceType: 'mainland' | 'freezone' | 'offshore';
  serviceLabel: string;
}

export default function LeadForm({ onSubmit, loading, serviceType, serviceLabel }: LeadFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    email: '',
    nationality: '',
    residenceCountry: '',
    emirate: '',
    activity: '',
    shareholdersCount: '',
    visasRequired: '',
    visasCount: '',
    timeline: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      shareholdersCount: formData.shareholdersCount ? parseInt(formData.shareholdersCount) : null,
      visasCount: formData.visasCount ? parseInt(formData.visasCount) : null,
      email: formData.email || null,
      nationality: formData.nationality || null,
      residenceCountry: formData.residenceCountry || null,
      emirate: formData.emirate || null,
      activity: formData.activity || null,
      timeline: formData.timeline || null,
      notes: formData.notes || null,
      visasRequired: formData.visasRequired === 'yes' ? true : formData.visasRequired === 'no' ? false : null,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleVisasRequiredChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      visasRequired: value,
      visasCount: value !== 'yes' ? '' : prev.visasCount,
    }));
  };

  const showEmirateField = serviceType === 'mainland';

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl border border-gray-100 p-8 space-y-8">
      {/* Contact Information */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="whatsapp"
              required
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="+971501234567"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nationality <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nationality"
              required
              value={formData.nationality}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="e.g., Indian, Pakistani"
              list="nationality-list"
            />
            <datalist id="nationality-list">
              <option value="Indian" />
              <option value="British" />
              <option value="Emirati" />
              <option value="Pakistani" />
              <option value="Bangladeshi" />
              <option value="Filipino" />
              <option value="Egyptian" />
              <option value="Lebanese" />
              <option value="Jordanian" />
              <option value="American" />
              <option value="Canadian" />
              <option value="Australian" />
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Country of Residence <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="residenceCountry"
              required
              value={formData.residenceCountry}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="e.g., UAE, India, UK"
            />
          </div>

          {showEmirateField && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Emirate <span className="text-red-500">*</span>
              </label>
              <select
                name="emirate"
                required
                value={formData.emirate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="">Select emirate</option>
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="Umm Al Quwain">Umm Al Quwain</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                <option value="Fujairah">Fujairah</option>
                <option value="Not Sure">Not Sure</option>
              </select>
              <small className="text-xs text-gray-500 mt-1 block">Select the emirate where you want to set up your company.</small>
            </div>
          )}
        </div>
      </div>

      {/* Service Information */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-900">Service Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Type
            </label>
            <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
              {serviceLabel}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Timeline
            </label>
            <select
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Select timeline</option>
              <option value="immediately">Immediately</option>
              <option value="within-1-month">Within 1 month</option>
              <option value="1-3-months">1–3 months</option>
              <option value="exploring">Exploring</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Business Activity <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="activity"
              required
              value={formData.activity}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="e.g., Trading, IT Services"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Shareholders
            </label>
            <select
              name="shareholdersCount"
              value={formData.shareholdersCount}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Select</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4+">4+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visa Requirements */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-900">Visa Requirements</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Visas Required?
            </label>
            <select
              name="visasRequired"
              value={formData.visasRequired}
              onChange={(e) => handleVisasRequiredChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {formData.visasRequired === 'yes' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                How many visas?
              </label>
              <select
                name="visasCount"
                value={formData.visasCount}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="">Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4+">4+</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-gray-600 to-gray-700 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-900">Additional Information</h2>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="Any additional notes or information about this lead..."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
        <Link
          href="/admin/leads/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Lead
            </>
          )}
        </button>
      </div>
    </form>
  );
}

