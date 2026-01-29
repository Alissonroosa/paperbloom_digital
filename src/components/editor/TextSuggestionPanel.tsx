'use client';

import React, { useState } from 'react';
import { 
  TextSuggestion, 
  SuggestionCategory, 
  SuggestionField,
  getSuggestionsByFieldAndCategory,
  getAllSuggestionCategories
} from '@/data/suggestions';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export interface TextSuggestionPanelProps {
  field: SuggestionField;
  currentValue: string;
  onSelectSuggestion: (text: string) => void;
  onClose: () => void;
}

/**
 * TextSuggestionPanel Component
 * 
 * Displays text suggestions filtered by field and category.
 * Users can select suggestions to insert into the corresponding field.
 * All inserted text remains editable.
 * 
 * Requirements: 9.4, 9.5, 9.6
 */
export function TextSuggestionPanel({
  field,
  currentValue,
  onSelectSuggestion,
  onClose,
}: TextSuggestionPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<SuggestionCategory>('romantico');
  const [confirmingReplace, setConfirmingReplace] = useState<string | null>(null);

  const categories = getAllSuggestionCategories();
  const suggestions = getSuggestionsByFieldAndCategory(field, selectedCategory);

  const fieldLabels: Record<SuggestionField, string> = {
    title: 'Título',
    message: 'Mensagem',
    closing: 'Fechamento',
  };

  const categoryLabels: Record<SuggestionCategory, string> = {
    romantico: 'Romântico',
    amigavel: 'Amigável',
    formal: 'Formal',
    casual: 'Casual',
  };

  const handleSuggestionClick = (suggestion: TextSuggestion) => {
    // If field already has content, ask for confirmation
    if (currentValue && currentValue.trim().length > 0) {
      setConfirmingReplace(suggestion.id);
    } else {
      // Field is empty, insert directly
      onSelectSuggestion(suggestion.text);
    }
  };

  const handleConfirmReplace = (suggestion: TextSuggestion) => {
    onSelectSuggestion(suggestion.text);
    setConfirmingReplace(null);
  };

  const handleCancelReplace = () => {
    setConfirmingReplace(null);
  };

  return (
    <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
      <CardHeader className="border-b flex-shrink-0 bg-white">
        <div className="flex items-center justify-between">
          <CardTitle id="suggestion-panel-title" className="text-base md:text-lg">
            Sugestões para {fieldLabels[field]}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 min-h-[44px] min-w-[44px] p-0"
            aria-label="Fechar painel de sugestões"
          >
            ✕
          </Button>
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2 mt-4 flex-wrap" role="group" aria-label="Filtrar sugestões por categoria">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs min-h-[44px]"
              aria-pressed={selectedCategory === category}
              aria-label={`Filtrar por ${categoryLabels[category]}`}
            >
              {categoryLabels[category]}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 overflow-y-auto flex-1 bg-white">
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" role="status">
            Nenhuma sugestão disponível para esta categoria.
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Lista de sugestões de texto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                role="listitem"
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all duration-200",
                  confirmingReplace === suggestion.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                )}
              >
                {confirmingReplace === suggestion.id ? (
                  // Confirmation state
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Substituir o texto atual por esta sugestão?
                    </p>
                    <p className="text-sm font-medium text-text-main">
                      "{suggestion.text}"
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleConfirmReplace(suggestion)}
                        className="min-h-[44px]"
                        aria-label="Confirmar substituição do texto"
                      >
                        Sim, substituir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelReplace}
                        className="min-h-[44px]"
                        aria-label="Cancelar substituição"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Normal state
                  <>
                    <p className="text-sm text-text-main mb-3">
                      {suggestion.text}
                    </p>
                    
                    {/* Tags */}
                    {suggestion.tags.length > 0 && (
                      <div className="flex gap-1 mb-3 flex-wrap">
                        {suggestion.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full min-h-[44px]"
                      aria-label={`Usar sugestão: ${suggestion.text}`}
                    >
                      Usar esta sugestão
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
