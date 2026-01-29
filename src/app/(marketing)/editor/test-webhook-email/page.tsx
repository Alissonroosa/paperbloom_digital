'use client';

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState } from "react";
import { Loader2, Mail, CheckCircle, XCircle } from "lucide-react";

/**
 * Test page for webhook email integration
 * This page allows manual testing of the email sending functionality
 */
export default function TestWebhookEmailPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testEmailSend = async () => {
    setLoading(true);
    setResult(null);

    try {
      // This would normally be triggered by the webhook
      // For testing, we'll call the email service directly via an API route
      const response = await fetch('/api/test/send-qrcode-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: 'test@example.com',
          recipientName: 'Test User',
          messageUrl: 'https://paperbloom.com/mensagem/test/123',
          senderName: 'Test Sender',
          messageTitle: 'Test Message',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: 'Email sent successfully!',
          details: data,
        });
      } else {
        setResult({
          success: false,
          message: 'Failed to send email',
          details: data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error sending email',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container px-4 md:px-8 max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif font-bold text-text-main">
            Test Webhook Email Integration
          </h1>
          <p className="text-muted-foreground">
            Test the email sending functionality that runs after successful payment
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Send Test</CardTitle>
            <CardDescription>
              This simulates the email that would be sent after a successful payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Test Configuration:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Recipient: test@example.com</li>
                <li>• Message URL: https://paperbloom.com/mensagem/test/123</li>
                <li>• Sender: Test Sender</li>
                <li>• Title: Test Message</li>
              </ul>
            </div>

            <Button
              onClick={testEmailSend}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Email...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>

            {result && (
              <div
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4
                      className={`font-semibold ${
                        result.success ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {result.message}
                    </h4>
                    {result.details && (
                      <pre className="mt-2 text-xs overflow-auto p-2 bg-white rounded border">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Webhook Flow:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Customer completes payment on Stripe</li>
              <li>Stripe sends webhook to /api/checkout/webhook</li>
              <li>Webhook handler verifies signature</li>
              <li>Updates message status to 'paid'</li>
              <li>Generates QR code and slug</li>
              <li>Sends email with QR code to customer</li>
              <li>Redirects customer to success page</li>
            </ol>
            <p className="mt-4">
              <strong>Email Features:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>QR code embedded as inline image</li>
              <li>Clickable message URL</li>
              <li>Sharing instructions</li>
              <li>Retry logic with exponential backoff (3 attempts)</li>
              <li>Graceful error handling (logs but doesn't block)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
