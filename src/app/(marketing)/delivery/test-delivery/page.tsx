'use client';

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { useState } from "react";

/**
 * Test page for Delivery Page
 * Allows testing the delivery page with mock data
 */
export default function TestDeliveryPage() {
  const [messageId, setMessageId] = useState('');

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container px-4 md:px-8 max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif font-bold text-text-main">
            Test Delivery Page
          </h1>
          <p className="text-muted-foreground">
            Enter a message ID to test the delivery page
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Page Tester</CardTitle>
            <CardDescription>
              Test the delivery page with different message IDs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Message ID (UUID)</label>
              <input
                type="text"
                value={messageId}
                onChange={(e) => setMessageId(e.target.value)}
                placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Enter a valid message UUID from your database
              </p>
            </div>

            <div className="flex gap-2">
              <Link 
                href={messageId ? `/delivery/${messageId}` : '#'}
                className="flex-1"
              >
                <Button 
                  className="w-full"
                  disabled={!messageId}
                >
                  View Delivery Page
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setMessageId('')}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>QR code displays prominently (Requirement 11.2)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Message URL shown with copy button (Requirement 11.3)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Download QR code button in PNG format (Requirement 11.4)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Sharing instructions displayed (Requirement 11.5)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Email confirmation message shown (Requirement 11.6)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-yellow-900">
                Testing Tips:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Use a message ID from a paid message to see the full experience</li>
                <li>Test with a pending message to see how it handles unpaid messages</li>
                <li>Try an invalid UUID to test error handling</li>
                <li>Test the copy and download buttons</li>
                <li>Check responsive design on mobile devices</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/editor/mensagem">
            <Button variant="ghost">Back to Editor</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
