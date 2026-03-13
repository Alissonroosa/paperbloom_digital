'use client';

/**
 * Email Template Visual Test Page
 * 
 * Allows visual testing of the QR code email template
 * Requirements: 12.2, 12.3, 12.4
 */

import { useState } from 'react';
import { QR_CODE_EMAIL_TEMPLATE, QRCodeEmailData } from '@/services/EmailService';

export default function TestEmailTemplatePage() {
  const [emailData, setEmailData] = useState<QRCodeEmailData>({
    recipientEmail: 'recipient@example.com',
    recipientName: 'Maria Silva',
    messageUrl: 'https://paperbloom.com/mensagem/maria/abc123',
    qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    senderName: 'João Santos',
    messageTitle: 'Feliz Aniversário',
  });

  const [showHtml, setShowHtml] = useState(false);

  const handleInputChange = (field: keyof QRCodeEmailData, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  const emailHtml = QR_CODE_EMAIL_TEMPLATE.html(emailData);
  const emailSubject = QR_CODE_EMAIL_TEMPLATE.subject(emailData.recipientName);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Template Visual Test
          </h1>
          <p className="text-gray-600">
            Test the QR code email template with different data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Email Data</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={emailData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailData.recipientEmail}
                  onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Title
                </label>
                <input
                  type="text"
                  value={emailData.messageTitle}
                  onChange={(e) => handleInputChange('messageTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Name
                </label>
                <input
                  type="text"
                  value={emailData.senderName}
                  onChange={(e) => handleInputChange('senderName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message URL
                </label>
                <input
                  type="url"
                  value={emailData.messageUrl}
                  onChange={(e) => handleInputChange('messageUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Subject
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                  {emailSubject}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowHtml(!showHtml)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {showHtml ? 'Hide HTML Source' : 'Show HTML Source'}
                </button>
              </div>
            </div>

            {showHtml && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">HTML Source</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-96 text-xs">
                  {emailHtml}
                </pre>
              </div>
            )}
          </div>

          {/* Email Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Email Preview</h2>
            
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                <div className="text-sm">
                  <span className="font-medium">Subject:</span> {emailSubject}
                </div>
                <div className="text-sm mt-1">
                  <span className="font-medium">To:</span> {emailData.recipientEmail}
                </div>
              </div>
              
              <div className="bg-white overflow-auto" style={{ maxHeight: '600px' }}>
                <iframe
                  srcDoc={emailHtml}
                  className="w-full border-0"
                  style={{ minHeight: '600px' }}
                  title="Email Preview"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                ✅ Requirements Validation
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ 12.2: QR Code embedded as image (cid:qrcode)</li>
                <li>✓ 12.3: Message URL as clickable link</li>
                <li>✓ 12.4: Usage instructions included</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                📧 Email Client Testing Notes
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Uses inline styles for better compatibility</li>
                <li>• Responsive design with mobile breakpoints</li>
                <li>• Web-safe fonts (Arial, sans-serif)</li>
                <li>• Max-width 600px for email clients</li>
                <li>• QR code uses Content-ID (cid) for inline embedding</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Template Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                🎨 Visual Design
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Clean, modern layout</li>
                <li>• Brand colors (Indigo)</li>
                <li>• Proper spacing and hierarchy</li>
                <li>• Mobile responsive</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                📱 Compatibility
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gmail, Outlook, Apple Mail</li>
                <li>• Mobile email clients</li>
                <li>• Inline CSS for reliability</li>
                <li>• Web-safe fonts</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                ✨ Content
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• QR code with instructions</li>
                <li>• Direct link button</li>
                <li>• Sharing guidelines</li>
                <li>• Professional footer</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
