'use client'

import { getRiskAlertEmailTemplate, getWelcomeEmailTemplate } from '@/lib/email-templates'
import type { RiskLevel } from '@/lib/risk-calculator'
import { useEffect, useState } from 'react'

const sampleWelcomeData = {
  userName: 'Maria Gonzalez',
  userEmail: 'maria@example.com',
}

const sampleRiskData = {
  userName: 'Maria Gonzalez',
  userEmail: 'maria@example.com',
  farmName: 'Gonzalez Family Orchards',
  trapName: 'North Block Trap A',
  pestTypeName: 'Codling Moth',
  riskLevel: 'danger' as RiskLevel,
  previousRiskLevel: 'warning' as RiskLevel | null,
  currentRate: 3.5,
  ratePercentage: 175,
  message: 'Action required: Average rate (3.5/day) exceeds 2/day',
  actionMessage: 'Action window now. Coordinate treatment timing.',
  observationDate: '2026-02-01',
  observationCount: 12,
}

export default function EmailPreviewPage() {
  const [templateType, setTemplateType] = useState<'welcome' | 'risk'>('welcome')
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('danger')
  const [showRawHtml, setShowRawHtml] = useState(false)
  const [emailWidth, setEmailWidth] = useState<'mobile' | 'desktop'>('desktop')

  // Redirect in production
  useEffect(() => {
    // Check if we're in production (client-side check)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Only allow on localhost in development
      if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
        window.location.href = '/'
      }
    }
  }, [])

  const welcomeEmail = getWelcomeEmailTemplate(
    sampleWelcomeData.userName,
    sampleWelcomeData.userEmail,
  )

  const riskEmailData = {
    ...sampleRiskData,
    riskLevel,
    previousRiskLevel: riskLevel === 'warning' ? 'safe' : riskLevel === 'danger' ? 'warning' : null,
  }

  const riskEmail = getRiskAlertEmailTemplate(riskEmailData)

  const currentEmail = templateType === 'welcome' ? welcomeEmail : riskEmail

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentEmail.html)
    alert('HTML copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Warning Banner */}
        <div className="bg-amber-100 border-l-4 border-amber-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-amber-800">
                Development Preview Only - This page is not accessible in production
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Email Template Preview</h1>

          <div className="space-y-4">
            {/* Template Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTemplateType('welcome')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    templateType === 'welcome'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Welcome Email
                </button>
                <button
                  onClick={() => setTemplateType('risk')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    templateType === 'risk'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Risk Alert Email
                </button>
              </div>
            </div>

            {/* Risk Level Selector (only for risk alerts) */}
            {templateType === 'risk' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level
                </label>
                <div className="flex gap-2">
                  {(['safe', 'warning', 'danger'] as RiskLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setRiskLevel(level)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                        riskLevel === level
                          ? level === 'safe'
                            ? 'bg-green-600 text-white'
                            : level === 'warning'
                              ? 'bg-amber-600 text-white'
                              : 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View Options */}
            <div className="flex gap-4 items-center flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showRawHtml}
                  onChange={(e) => setShowRawHtml(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Raw HTML</span>
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => setEmailWidth('mobile')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    emailWidth === 'mobile'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mobile
                </button>
                <button
                  onClick={() => setEmailWidth('desktop')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    emailWidth === 'desktop'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Desktop
                </button>
              </div>

              <button
                onClick={copyToClipboard}
                className="ml-auto px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                Copy HTML
              </button>
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div
            className={`bg-gray-100 rounded-lg p-4 ${
              emailWidth === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
            }`}
          >
            {showRawHtml ? (
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-xs max-w-full">
                <code>{currentEmail.html}</code>
              </pre>
            ) : (
              <div
                className="bg-white rounded shadow mx-auto"
                style={{
                  maxWidth: emailWidth === 'mobile' ? '100%' : '600px',
                  width: emailWidth === 'mobile' ? '100%' : 'auto',
                }}
                dangerouslySetInnerHTML={{ __html: currentEmail.html }}
              />
            )}
          </div>

          {/* Plain Text Preview */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              View Plain Text Version
            </summary>
            <pre className="mt-2 bg-gray-50 p-4 rounded border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap max-w-full overflow-x-auto">
              {currentEmail.text}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}
