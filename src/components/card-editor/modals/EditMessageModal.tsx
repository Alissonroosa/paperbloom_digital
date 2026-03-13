'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/types/card';
import { Button } from '@/components/ui/Button';

/**
 * EditMessageModal Props
 * Requirements: 3.2, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */
interface EditMessageModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardId: string, data: { title: string; messageText: string }) => Promise<void>;
}

/**
 * Character limits
 * Requirements: 4.2
 */
const TITLE_MAX_LENGTH = 200;
const MESSAGE_MAX_LENGTH = 500;

/**
 * EditMessageModal Component
 * 
 * Modal for editing card title and message text with validation and character counting.
 * 
 * Features:
 * - Title field with 200 character limit
 * - Message textarea with 500 character limit
 * - Real-time character counter
 * - Input validation
 * - Unsaved changes confirmation
 * - Responsive design (fullscreen on mobile)
 * 
 * Requirements: 3.2, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */
export function EditMessageModal({ card, isOpen, onClose, onSave }: EditMessageModalProps) {
  const [title, setTitle] = useState(card.title);
  const [messageText, setMessageText] = useState(card.messageText);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; messageText?: string }>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Refs for focus management
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const firstFocusableRef = React.useRef<HTMLInputElement>(null);
  const lastFocusableRef = React.useRef<HTMLButtonElement>(null);

  // Reset state when card changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(card.title);
      setMessageText(card.messageText);
      setErrors({});
      setHasChanges(false);
      setShowConfirmation(false);
      
      // Focus management: Focus first input when modal opens
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, card.title, card.messageText]);

  // Track changes
  useEffect(() => {
    const changed = title !== card.title || messageText !== card.messageText;
    setHasChanges(changed);
  }, [title, messageText, card.title, card.messageText]);

  // Validate inputs
  const validate = useCallback((): boolean => {
    const newErrors: { title?: string; messageText?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'O título é obrigatório';
    } else if (title.length > TITLE_MAX_LENGTH) {
      newErrors.title = `O título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres`;
    }

    if (!messageText.trim()) {
      newErrors.messageText = 'A mensagem é obrigatória';
    } else if (messageText.length > MESSAGE_MAX_LENGTH) {
      newErrors.messageText = `A mensagem deve ter no máximo ${MESSAGE_MAX_LENGTH} caracteres`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, messageText]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(card.id, {
        title: title.trim(),
        messageText: messageText.trim(),
      });
      onClose();
    } catch (error) {
      console.error('Error saving card:', error);
      setErrors({
        messageText: 'Erro ao salvar. Tente novamente.',
      });
    } finally {
      setIsSaving(false);
    }
  }, [card.id, title, messageText, validate, onSave, onClose]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  // Handle close (clicking outside or escape)
  const handleClose = useCallback(() => {
    if (hasChanges) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } 
      // Ctrl/Cmd + Enter to save
      else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
      // Tab key for focus trap
      else if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'input:not([disabled]), textarea:not([disabled]), button:not([disabled])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handleSave]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Character counts
  const titleCharsRemaining = TITLE_MAX_LENGTH - title.length;
  const messageCharsRemaining = MESSAGE_MAX_LENGTH - messageText.length;
  const titleExceeded = titleCharsRemaining < 0;
  const messageExceeded = messageCharsRemaining < 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div
          className="bg-white w-full h-full sm:h-auto sm:rounded-lg shadow-xl sm:max-w-2xl sm:max-h-[90vh] md:max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-900">
              Editar Mensagem
            </h2>
            <p id="modal-description" className="text-sm text-gray-600 mt-1">
              Carta {card.order} de 12
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {/* Title Field */}
            <div>
              <label htmlFor="card-title" className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500" aria-label="obrigatório">*</span>
              </label>
              <input
                ref={titleInputRef}
                id="card-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.title || titleExceeded
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Ex: Abra quando... estiver tendo um dia difícil"
                maxLength={TITLE_MAX_LENGTH + 50} // Allow typing beyond limit to show error
                aria-invalid={!!errors.title || titleExceeded}
                aria-describedby={errors.title ? 'title-error' : 'title-counter'}
                aria-required="true"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.title && (
                  <p id="title-error" className="text-sm text-red-600">
                    {errors.title}
                  </p>
                )}
                <p
                  id="title-counter"
                  className={`text-sm ml-auto ${
                    titleExceeded ? 'text-red-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {titleCharsRemaining} caracteres restantes
                </p>
              </div>
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="card-message" className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem <span className="text-red-500" aria-label="obrigatório">*</span>
              </label>
              <textarea
                id="card-message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={10}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none ${
                  errors.messageText || messageExceeded
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Escreva sua mensagem aqui..."
                maxLength={MESSAGE_MAX_LENGTH + 100} // Allow typing beyond limit to show error
                aria-invalid={!!errors.messageText || messageExceeded}
                aria-describedby={errors.messageText ? 'message-error' : 'message-counter'}
                aria-required="true"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.messageText && (
                  <p id="message-error" className="text-sm text-red-600">
                    {errors.messageText}
                  </p>
                )}
                <p
                  id="message-counter"
                  className={`text-sm ml-auto ${
                    messageExceeded ? 'text-red-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {messageCharsRemaining} caracteres restantes
                </p>
              </div>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              <p>Dica: Pressione Ctrl+Enter (ou Cmd+Enter) para salvar rapidamente</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="w-full sm:w-auto min-h-[44px]"
              aria-label="Cancelar edição"
            >
              Cancelar
            </Button>
            <Button
              ref={lastFocusableRef}
              onClick={handleSave}
              disabled={isSaving || titleExceeded || messageExceeded}
              className="w-full sm:w-auto min-h-[44px]"
              aria-label="Salvar alterações"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[60] transition-opacity"
            onClick={() => setShowConfirmation(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="confirmation-title" className="text-lg font-semibold text-gray-900 mb-2">
                Descartar alterações?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Você tem alterações não salvas. Deseja salvar antes de fechar?
              </p>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmation(false);
                    onClose();
                  }}
                  className="w-full sm:w-auto"
                >
                  Descartar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  className="w-full sm:w-auto"
                >
                  Continuar Editando
                </Button>
                <Button
                  onClick={async () => {
                    setShowConfirmation(false);
                    await handleSave();
                  }}
                  className="w-full sm:w-auto"
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
