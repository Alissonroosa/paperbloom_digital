'use client';

import React, { useState } from 'react';
import { PhotoUploadModal } from '@/components/card-editor/modals/PhotoUploadModal';
import { Card } from '@/types/card';
import { Button } from '@/components/ui/Button';
import { Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

/**
 * Test page for PhotoUploadModal component
 * 
 * This page allows testing the PhotoUploadModal in isolation with different scenarios:
 * - Card without photo
 * - Card with existing photo
 * - Upload new photo
 * - Remove photo
 * - Cancel with/without changes
 */
export default function PhotoUploadModalTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testCard, setTestCard] = useState<Card>({
    id: 'test-card-1',
    collectionId: 'test-collection',
    order: 1,
    title: 'Abra quando estiver triste',
    messageText: 'Esta é uma mensagem de teste para a carta. Você pode adicionar uma foto especial para acompanhar esta mensagem.',
    imageUrl: null,
    youtubeUrl: null,
    status: 'unopened',
    openedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
  };

  const handleSave = async (cardId: string, imageUrl: string) => {
    addLog(`Save called: cardId=${cardId}, imageUrl=${imageUrl}`);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Update card
    setTestCard((prev) => ({
      ...prev,
      imageUrl,
    }));
    
    addLog('Photo saved successfully');
  };

  const handleRemove = async (cardId: string) => {
    addLog(`Remove called: cardId=${cardId}`);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Remove photo
    setTestCard((prev) => ({
      ...prev,
      imageUrl: null,
    }));
    
    addLog('Photo removed successfully');
  };

  const handleClose = () => {
    addLog('Modal closed');
    setIsModalOpen(false);
  };

  const resetCard = () => {
    setTestCard({
      id: 'test-card-1',
      collectionId: 'test-collection',
      order: 1,
      title: 'Abra quando estiver triste',
      messageText: 'Esta é uma mensagem de teste para a carta. Você pode adicionar uma foto especial para acompanhar esta mensagem.',
      imageUrl: null,
      youtubeUrl: null,
      status: 'unopened',
      openedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    addLog('Card reset to initial state');
  };

  const setExistingPhoto = () => {
    setTestCard((prev) => ({
      ...prev,
      imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop',
    }));
    addLog('Set existing photo URL');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PhotoUploadModal Test Page
          </h1>
          <p className="text-gray-600">
            Test the PhotoUploadModal component with different scenarios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Controls and Card Preview */}
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Controls
              </h2>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    addLog('Opening modal');
                    setIsModalOpen(true);
                  }}
                  className="w-full"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {testCard.imageUrl ? 'Edit Photo' : 'Add Photo'}
                </Button>
                
                <Button
                  onClick={resetCard}
                  variant="outline"
                  className="w-full"
                >
                  Reset Card (No Photo)
                </Button>
                
                <Button
                  onClick={setExistingPhoto}
                  variant="outline"
                  className="w-full"
                >
                  Set Existing Photo
                </Button>
              </div>
            </div>

            {/* Card Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Card Preview
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <p className="text-gray-900">{testCard.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <p className="text-gray-600 text-sm">{testCard.messageText}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo
                  </label>
                  {testCard.imageUrl ? (
                    <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={testCard.imageUrl}
                        alt="Card photo"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setTestCard((prev) => ({ ...prev, imageUrl: null }));
                            addLog('Photo removed via preview');
                          }}
                          className="bg-white/90 hover:bg-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">No photo</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Logs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Event Log
              </h2>
              <Button
                onClick={() => setLogs([])}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 h-[600px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  No events yet. Interact with the modal to see logs.
                </p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="text-sm font-mono text-gray-700 bg-white rounded px-3 py-2 border border-gray-200"
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Scenarios */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                1. Upload New Photo
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Click "Reset Card (No Photo)"</li>
                <li>Click "Add Photo"</li>
                <li>Select or drag a valid image file</li>
                <li>Verify preview appears</li>
                <li>Click "Salvar"</li>
                <li>Verify photo appears in card preview</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                2. Edit Existing Photo
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Click "Set Existing Photo"</li>
                <li>Click "Edit Photo"</li>
                <li>Verify current photo is shown</li>
                <li>Select a new image</li>
                <li>Verify new preview appears</li>
                <li>Click "Salvar"</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                3. Remove Photo
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Click "Set Existing Photo"</li>
                <li>Click "Edit Photo"</li>
                <li>Click "Remover Foto"</li>
                <li>Verify photo is removed</li>
                <li>Verify modal closes</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                4. Cancel with Changes
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Click "Add Photo"</li>
                <li>Select an image</li>
                <li>Click "Cancelar"</li>
                <li>Verify confirmation dialog appears</li>
                <li>Test both "Descartar" and "Continuar Editando"</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                5. Validation - Invalid Format
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Click "Add Photo"</li>
                <li>Try to upload a .txt or .pdf file</li>
                <li>Verify error message appears</li>
                <li>Verify "Tentar Novamente" button works</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                6. Validation - File Too Large
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Click "Add Photo"</li>
                <li>Try to upload an image larger than 5MB</li>
                <li>Verify error message with file size</li>
                <li>Verify upload is prevented</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                7. Drag and Drop
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Click "Add Photo"</li>
                <li>Drag an image file over the drop zone</li>
                <li>Verify visual feedback (blue border)</li>
                <li>Drop the file</li>
                <li>Verify preview appears</li>
              </ol>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                8. Responsive Design
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Open modal on desktop</li>
                <li>Verify centered modal with max-width</li>
                <li>Resize to mobile viewport</li>
                <li>Verify fullscreen modal</li>
                <li>Test all interactions on mobile</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Requirements Coverage */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Requirements Coverage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-semibold">✓</span>
                <div>
                  <span className="font-medium">3.3:</span> Modal opens on button click
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-semibold">✓</span>
                <div>
                  <span className="font-medium">5.1:</span> Drag-and-drop upload area
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-semibold">✓</span>
                <div>
                  <span className="font-medium">5.2:</span> Current photo preview
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-semibold">✓</span>
                <div>
                  <span className="font-medium">5.3:</span> Format validation (JPEG, PNG, WebP)
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-semibold">✓</span>
                <div>
                  <span className="font-medium">5.4:</span> Size validation (max 5MB)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-semibold">✓</span>
                <div>
                  <span className="font-medium">5.5:</span> Upload progress indicator
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-semibold">✓</span>
                <div>
                  <span className="font-medium">5.6:</span> Remove photo button
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-semibold">✓</span>
                <div>
                  <span className="font-medium">5.7:</span> Cancel with confirmation
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <PhotoUploadModal
        card={testCard}
        isOpen={isModalOpen}
        onClose={handleClose}
        onSave={handleSave}
        onRemove={handleRemove}
      />
    </div>
  );
}
