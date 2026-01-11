'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BankLeadFormProps {
  onSubmit: (formData: any) => void;
  loading: boolean;
}

export default function BankLeadForm({ onSubmit, loading }: BankLeadFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    email: '',
    uaeSetupType: '',
    primaryActivityCategory: '',
    primaryActivityDetails: '',
    ownerUaeResident: '',
    uboNationality: '',
    expectedMonthlyTurnoverAed: '',
    paymentGeographies: [] as string[],
    paymentGeographiesOther: '',
    involvesCrypto: '',
    cashIntensive: '',
    sanctionedHighRiskCountries: '',
    kycDocsReady: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build serviceDetails object for bank account prescreen
    const serviceDetails = {
      bankAccountPrescreen: {
        uaeSetupType: formData.uaeSetupType,
        primaryActivityCategory: formData.primaryActivityCategory,
        primaryActivityDetails: formData.primaryActivityDetails || null,
        ownerUaeResident: formData.ownerUaeResident,
        uboNationality: formData.uboNationality,
        expectedMonthlyTurnoverAed: formData.expectedMonthlyTurnoverAed,
        paymentGeographies: formData.paymentGeographies,
        paymentGeographiesOther: formData.paymentGeographiesOther || null,
        involvesCrypto: formData.involvesCrypto,
        cashIntensive: formData.cashIntensive,
        sanctionedHighRiskCountries: formData.sanctionedHighRiskCountries,
        kycDocsReady: formData.kycDocsReady,
      }
    };

    onSubmit({
      fullName: formData.fullName,
      whatsapp: formData.whatsapp,
      email: formData.email || null,
      notes: formData.notes || null,
      serviceDetails: serviceDetails,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      paymentGeographies: checked
        ? [...prev.paymentGeographies, value]
        : prev.paymentGeographies.filter((g) => g !== value),
    }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showPrimaryActivityDetails = formData.primaryActivityCategory === 'TRADING_SPECIFIC_GOODS' || formData.primaryActivityCategory === 'OTHER';
  const showPaymentGeographiesOther = formData.paymentGeographies.includes('OTHER');

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
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="whatsapp"
              required
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="+971 50 123 4567"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          <div className="md:col-span-2">
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
              placeholder="john.smith@example.com"
            />
          </div>
        </div>
      </div>

      {/* Business Snapshot */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-900">Business Snapshot</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              UAE setup type <span className="text-red-500">*</span>
            </label>
            <select
              name="uaeSetupType"
              required
              value={formData.uaeSetupType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Select</option>
              <option value="MAINLAND">Mainland</option>
              <option value="FREE_ZONE">Free Zone</option>
              <option value="OFFSHORE">Offshore</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Primary business activity <span className="text-red-500">*</span>
            </label>
            <select
              name="primaryActivityCategory"
              required
              value={formData.primaryActivityCategory}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Select</option>
              <option value="GENERAL_TRADING">General Trading</option>
              <option value="TRADING_SPECIFIC_GOODS">Trading (specific goods)</option>
              <option value="SERVICES_CONSULTANCY">Services / Consultancy</option>
              <option value="IT_SOFTWARE">IT / Software</option>
              <option value="MARKETING_MEDIA">Marketing / Media</option>
              <option value="ECOMMERCE">E-commerce</option>
              <option value="LOGISTICS_SHIPPING">Logistics / Shipping</option>
              <option value="MANUFACTURING">Manufacturing</option>
              <option value="REAL_ESTATE_RELATED">Real Estate related</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {showPrimaryActivityDetails && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Activity details <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="primaryActivityDetails"
                required={showPrimaryActivityDetails}
                value={formData.primaryActivityDetails}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                placeholder="e.g., electronics, textiles, foodstuff"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Is the business owner a UAE resident? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ownerUaeResident"
                  checked={formData.ownerUaeResident === 'yes'}
                  onChange={() => handleRadioChange('ownerUaeResident', 'yes')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ownerUaeResident"
                  checked={formData.ownerUaeResident === 'no'}
                  onChange={() => handleRadioChange('ownerUaeResident', 'no')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              UBO's Nationality <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="uboNationality"
              required
              value={formData.uboNationality}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="e.g., Indian, British, Emirati"
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
            <small className="text-xs text-gray-500 mt-1 block">UBO (Ultimate Beneficial Owner) is the person who owns majority control of the company (typically 25% or more ownership or significant decision-making authority).</small>
          </div>
        </div>
      </div>

      {/* Expected Account Use */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-emerald-600 to-teal-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-900">Expected Account Use</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expected monthly account turnover (AED) <span className="text-red-500">*</span>
            </label>
            <select
              name="expectedMonthlyTurnoverAed"
              required
              value={formData.expectedMonthlyTurnoverAed}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Select</option>
              <option value="UNDER_100K">Under 100,000</option>
              <option value="100K_500K">100,000 – 500,000</option>
              <option value="500K_2M">500,000 – 2,000,000</option>
              <option value="OVER_2M">Over 2,000,000</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Main countries/regions you will send/receive payments to/from <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {['UAE', 'GCC', 'UK', 'EUROPE', 'USA_CANADA', 'ASIA', 'AFRICA', 'OTHER'].map((geo) => (
                <label key={geo} className="flex items-center gap-2 cursor-pointer p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    value={geo}
                    checked={formData.paymentGeographies.includes(geo)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {geo === 'USA_CANADA' ? 'USA / Canada' : geo.charAt(0) + geo.slice(1).toLowerCase().replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
            <small className="text-xs text-gray-500 mt-2 block">Select all that apply</small>
          </div>

          {showPaymentGeographiesOther && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Other geographies <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="paymentGeographiesOther"
                required={showPaymentGeographiesOther}
                value={formData.paymentGeographiesOther}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                placeholder="Specify other countries/regions"
              />
            </div>
          )}
        </div>
      </div>

      {/* Compliance Flags */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-orange-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-900">Compliance Flags</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
            <label className="text-sm font-semibold text-gray-700">
              Crypto / digital assets involved? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="involvesCrypto"
                  checked={formData.involvesCrypto === 'yes'}
                  onChange={() => handleRadioChange('involvesCrypto', 'yes')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="involvesCrypto"
                  checked={formData.involvesCrypto === 'no'}
                  onChange={() => handleRadioChange('involvesCrypto', 'no')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
            <label className="text-sm font-semibold text-gray-700">
              Cash-intensive business? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cashIntensive"
                  checked={formData.cashIntensive === 'yes'}
                  onChange={() => handleRadioChange('cashIntensive', 'yes')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cashIntensive"
                  checked={formData.cashIntensive === 'no'}
                  onChange={() => handleRadioChange('cashIntensive', 'no')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
            <label className="text-sm font-semibold text-gray-700">
              Any sanctioned / high-risk countries expected? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sanctionedHighRiskCountries"
                  checked={formData.sanctionedHighRiskCountries === 'yes'}
                  onChange={() => handleRadioChange('sanctionedHighRiskCountries', 'yes')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sanctionedHighRiskCountries"
                  checked={formData.sanctionedHighRiskCountries === 'no'}
                  onChange={() => handleRadioChange('sanctionedHighRiskCountries', 'no')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  required
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Readiness */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-900">Readiness</h2>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Can you provide standard KYC documents if the case is feasible? <span className="text-red-500">*</span>
          </label>
          <select
            name="kycDocsReady"
            required
            value={formData.kycDocsReady}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          >
            <option value="">Select</option>
            <option value="YES">Yes</option>
            <option value="NOT_YET">Not yet</option>
          </select>
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
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="Any additional information..."
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
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
