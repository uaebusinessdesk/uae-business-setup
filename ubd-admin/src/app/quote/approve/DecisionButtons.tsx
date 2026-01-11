'use client';

import { useState } from 'react';

interface DecisionButtonsProps {
  token: string;
  alreadyProceeded: boolean;
  alreadyDeclined: boolean;
  alreadyHasQuestions?: boolean;
  proceedDate?: Date | null;
  declineDate?: Date | null;
  questionsDate?: Date | null;
  supportEmail: string;
  supportWhatsApp?: string;
  onDecisionComplete?: () => void;
}

export default function DecisionButtons({
  token,
  alreadyProceeded,
  alreadyDeclined,
  alreadyHasQuestions = false,
  proceedDate,
  declineDate,
  questionsDate,
  supportEmail,
  supportWhatsApp = '+971 50 420 9110',
  onDecisionComplete,
}: DecisionButtonsProps) {
  const [loading, setLoading] = useState<'proceed' | 'decline' | 'questions' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<'proceed' | 'decline' | 'questions' | null>(null);
  const [showQuestionsForm, setShowQuestionsForm] = useState(false);
  const [questionsText, setQuestionsText] = useState('');

  const handleDecision = async (decision: 'proceed' | 'decline' | 'questions', questionsReason?: string) => {
    setLoading(decision);
    setError(null);
    setSuccess(null);

    try {
      const requestBody: any = { token, decision };
      if (questionsReason) {
        requestBody.questionsReason = questionsReason;
      }

      const response = await fetch('/api/quote/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to process decision');
        setLoading(null);
        return;
      }

      // Handle success - check if already decided (now returns success with flag)
      if (data.alreadyProceeded || data.alreadyDeclined || data.alreadyHasQuestions) {
        setSuccess(data.decision);
      } else {
        // Fresh decision
        setSuccess(decision);
      }
      
      // Clear questions form if questions were submitted
      if (decision === 'questions') {
        setQuestionsText('');
        setShowQuestionsForm(false);
      }
      
      // Refresh parent page state to get latest data from DB
      if (onDecisionComplete) {
        onDecisionComplete();
      }
    } catch (err: any) {
      console.error('Decision error:', err);
      setError(err.message || 'Failed to process decision');
    } finally {
      setLoading(null);
    }
  };

  // Format date helper
  const formatDate = (date: Date | string): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleString('en-GB', {
      timeZone: 'Asia/Dubai',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // If already proceeded or just proceeded, show next action screen
  if (alreadyProceeded || success === 'proceed') {
    const date = proceedDate || (success === 'proceed' ? new Date() : null);
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-green-600 mt-0.5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-green-800 font-bold text-lg mb-2">
              Thank you! Your decision has been received.
            </h3>
            <p className="text-green-700 text-base mb-4 leading-relaxed">
              We'll send you a secure payment link via email within one business day. Please check your inbox and complete the payment to proceed with your company setup.
            </p>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm text-green-600 mb-1">Need help?</p>
              <p className="text-sm text-green-700">
                Email: <a href={`mailto:${supportEmail}`} className="font-semibold hover:underline">{supportEmail}</a>
                {supportWhatsApp && (
                  <> | WhatsApp: <a href={`https://wa.me/${supportWhatsApp.replace(/[^0-9]/g, '')}`} className="font-semibold hover:underline">{supportWhatsApp}</a></>
                )}
              </p>
            </div>
            {date && (
              <p className="text-xs text-green-600 mt-4 italic">
                Confirmed on {formatDate(date)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If already has questions or just submitted questions, show next action screen
  if (alreadyHasQuestions || success === 'questions') {
    const date = questionsDate || (success === 'questions' ? new Date() : null);
    return (
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-amber-600 mt-0.5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-amber-800 font-bold text-lg mb-2">
              Thank you! We've received your questions and will contact you to discuss.
            </h3>
            <p className="text-amber-700 text-base mb-4 leading-relaxed">
              Our team will contact you within one business day to discuss your questions. We'll reach out via email or WhatsApp at the contact details you provided.
            </p>
            <div className="mt-4 pt-4 border-t border-amber-200">
              <p className="text-sm text-amber-600 mb-1">Need immediate assistance?</p>
              <p className="text-sm text-amber-700">
                Email: <a href={`mailto:${supportEmail}`} className="font-semibold hover:underline">{supportEmail}</a>
                {supportWhatsApp && (
                  <> | WhatsApp: <a href={`https://wa.me/${supportWhatsApp.replace(/[^0-9]/g, '')}`} className="font-semibold hover:underline">{supportWhatsApp}</a></>
                )}
              </p>
            </div>
            {date && (
              <p className="text-xs text-amber-600 mt-4 italic">
                Questions submitted on {formatDate(date)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If already declined or just declined, show next action screen
  if (alreadyDeclined || success === 'decline') {
    const date = declineDate || (success === 'decline' ? new Date() : null);
    return (
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-gray-600 mt-0.5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-gray-800 font-bold text-lg mb-2">
              Thank you for your response.
            </h3>
            <p className="text-gray-700 text-base mb-4 leading-relaxed">
              No problem - if you change your mind or have questions later, feel free to contact us. We're here to help with your UAE business setup journey.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Have questions or want to discuss?</p>
              <p className="text-sm text-gray-700">
                Email: <a href={`mailto:${supportEmail}`} className="font-semibold hover:underline">{supportEmail}</a>
                {supportWhatsApp && (
                  <> | WhatsApp: <a href={`https://wa.me/${supportWhatsApp.replace(/[^0-9]/g, '')}`} className="font-semibold hover:underline">{supportWhatsApp}</a></>
                )}
              </p>
            </div>
            {date && (
              <p className="text-xs text-gray-600 mt-4 italic">
                Response received on {formatDate(date)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show questions form if clicked
  if (showQuestionsForm) {
    const handleSubmitQuestions = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!questionsText.trim()) {
        setError('Please enter your questions before submitting.');
        return;
      }
      await handleDecision('questions', questionsText.trim());
      setShowQuestionsForm(false);
    };

    const handleCancelQuestions = () => {
      setShowQuestionsForm(false);
      setQuestionsText('');
      setError(null);
    };

    return (
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start mb-4">
            <svg className="w-6 h-6 text-amber-600 mt-0.5 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-amber-800 font-bold text-lg mb-2">
                What questions do you have?
              </h3>
              <p className="text-amber-700 text-sm mb-4">
                Please share your questions below. Our team will contact you within one business day to discuss.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitQuestions} className="space-y-4">
            <div>
              <label htmlFor="questions-textarea" className="block text-sm font-medium text-amber-800 mb-2">
                Your Questions <span className="text-red-500">*</span>
              </label>
              <textarea
                id="questions-textarea"
                value={questionsText}
                onChange={(e) => setQuestionsText(e.target.value)}
                placeholder="Please type your questions here..."
                required
                rows={5}
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400 resize-y"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading === 'questions' || !questionsText.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading === 'questions' ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Questions'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelQuestions}
                disabled={loading === 'questions'}
                className="px-6 py-3 bg-white border-2 border-amber-300 text-amber-700 rounded-lg font-semibold hover:bg-amber-50 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Show decision buttons
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Primary: Proceed */}
        <button
          onClick={() => handleDecision('proceed')}
          disabled={loading !== null}
          className="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {loading === 'proceed' ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Accept Quote
            </span>
          )}
        </button>

        {/* Secondary: Questions */}
        <button
          onClick={() => setShowQuestionsForm(true)}
          disabled={loading !== null}
          className="flex-1 px-8 py-4 bg-white border-2 border-amber-300 text-amber-700 rounded-xl font-semibold text-lg hover:bg-amber-50 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {loading === 'questions' ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              I Have Questions
            </span>
          )}
        </button>

        {/* Tertiary: Decline */}
        <button
          onClick={() => handleDecision('decline')}
          disabled={loading !== null}
          className="flex-1 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {loading === 'decline' ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Decline Quote
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
