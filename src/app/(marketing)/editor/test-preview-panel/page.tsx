'use client';

import { useState } from 'react';
import { PreviewPanel } from '@/components/wizard/PreviewPanel';
import { WizardFormData, WizardUploadStates } from '@/types/wizard';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';

/**
 * Test page for PreviewPanel component
 * Demonstrates real-time preview updates and view mode toggling
 */
export default function TestPreviewPanelPage() {
  const [viewMode, setViewMode] = useState<'card' | 'cinema'>('card');
  const [data, setData] = useState<WizardFormData>({
    pageTitle: 'Feliz Aniversário',
    urlSlug: 'feliz-aniversario',
    specialDate: new Date('2024-12-25'),
    recipientName: 'Maria',
    senderName: 'João',
    mainMessage: 'Desejo a você um dia maravilhoso cheio de alegria e amor. Que todos os seus sonhos se realizem!',
    mainImage: null,
    galleryImages: [null, null, null, null, null, null, null],
    backgroundColor: '#FFE4E1',
    theme: 'light',
    customColor: null,
    youtubeUrl: '',
    musicStartTime: 0,
    contactName: 'João Silva',
    contactEmail: 'joao@example.com',
    contactPhone: '(11) 98765-4321',
    signature: 'Com carinho, João',
    closingMessage: 'Obrigado por fazer parte da minha vida.',
  });

  const [uploads] = useState<WizardUploadStates>({
    mainImage: {
      url: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&auto=format&fit=crop',
      isUploading: false,
      error: null,
    },
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop',
        isUploading: false,
        error: null,
      },
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop',
        isUploading: false,
        error: null,
      },
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
        isUploading: false,
        error: null,
      },
    ],
  });

  const updateField = (field: keyof WizardFormData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">PreviewPanel Test</h1>
          <p className="text-muted-foreground">
            Test the real-time preview panel with Card and Cinema views
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form Controls */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Message</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pageTitle">Page Title</Label>
                  <Input
                    id="pageTitle"
                    value={data.pageTitle}
                    onChange={(e) => updateField('pageTitle', e.target.value)}
                    placeholder="Enter page title"
                  />
                </div>

                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={data.recipientName}
                    onChange={(e) => updateField('recipientName', e.target.value)}
                    placeholder="Enter recipient name"
                  />
                </div>

                <div>
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input
                    id="senderName"
                    value={data.senderName}
                    onChange={(e) => updateField('senderName', e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <Label htmlFor="mainMessage">Main Message</Label>
                  <Textarea
                    id="mainMessage"
                    value={data.mainMessage}
                    onChange={(e) => updateField('mainMessage', e.target.value)}
                    placeholder="Enter your message"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.mainMessage.length}/500 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="signature">Signature</Label>
                  <Input
                    id="signature"
                    value={data.signature}
                    onChange={(e) => updateField('signature', e.target.value)}
                    placeholder="Enter signature"
                  />
                </div>

                <div>
                  <Label htmlFor="closingMessage">Closing Message</Label>
                  <Input
                    id="closingMessage"
                    value={data.closingMessage}
                    onChange={(e) => updateField('closingMessage', e.target.value)}
                    placeholder="Enter closing message"
                  />
                </div>

                <div>
                  <Label htmlFor="youtubeUrl">YouTube URL (optional)</Label>
                  <Input
                    id="youtubeUrl"
                    value={data.youtubeUrl}
                    onChange={(e) => updateField('youtubeUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Preview Info</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Current View Mode:</strong>{' '}
                  <span className="capitalize">{viewMode}</span>
                </p>
                <p>
                  <strong>Update Behavior:</strong> Preview updates within 300ms
                </p>
                <p>
                  <strong>Desktop:</strong> Sticky sidebar preview
                </p>
                <p>
                  <strong>Mobile:</strong> Floating button with full-screen modal
                </p>
              </div>
            </Card>
          </div>

          {/* Right: Preview Panel */}
          <PreviewPanel
            data={data}
            uploads={uploads}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>
    </div>
  );
}
