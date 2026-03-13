'use client';

import React from 'react';
import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  onClearDraft?: () => void;
}

export function AutoSaveIndicator({ 
  isSaving, 
  lastSaved,
  onClearDraft 
}: AutoSaveIndicatorProps) {
  const getStatusText = () => {
    if (isSaving) {
      return 'Salvando...';
    }
    if (lastSaved) {
      try {
        const timeAgo = formatDistanceToNow(lastSaved, { 
          addSuffix: true,
          locale: ptBR 
        });
        return `Salvo ${timeAgo}`;
      } catch {
        return 'Salvo';
      }
    }
    return 'Não salvo';
  };

  const getIcon = () => {
    if (isSaving) {
      return <Loader2 className="w-3 h-3 animate-spin" />;
    }
    if (lastSaved) {
      return <Cloud className="w-3 h-3" />;
    }
    return <CloudOff className="w-3 h-3" />;
  };

  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground" role="status" aria-live="polite">
      <div className="flex items-center gap-1.5">
        <span aria-hidden="true">{getIcon()}</span>
        <span>{getStatusText()}</span>
      </div>
      {lastSaved && onClearDraft && (
        <button
          onClick={onClearDraft}
          className="text-xs text-muted-foreground hover:text-foreground underline transition-colors min-h-[44px] px-2"
          aria-label="Limpar rascunho salvo"
        >
          Limpar rascunho
        </button>
      )}
    </div>
  );
}
