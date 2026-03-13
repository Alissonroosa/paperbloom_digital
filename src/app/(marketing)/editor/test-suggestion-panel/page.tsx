'use client';

import React, { useState } from 'react';
import { TextSuggestionPanel } from '@/components/editor/TextSuggestionPanel';
import { SuggestionField } from '@/data/suggestions';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

/**
 * Test page for TextSuggestionPanel component
 * 
 * This page allows testing the suggestion panel with different fields
 * and verifies that:
 * - Suggestions are filtered by field and category
 * - Selected suggestions are inserted into fields
 * - Inserted text remains editable
 * - Confirmation is requested when replacing existing text
 */
export default function TestSuggestionPanelPage() {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentField, setCurrentField] = useState<SuggestionField>('title');
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [closing, setClosing] = useState('');

  const handleOpenSuggestions = (field: SuggestionField) => {
    setCurrentField(field);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (text: string) => {
    // Insert suggestion into the appropriate field
    switch (currentField) {
      case 'title':
        setTitle(text);
        break;
      case 'message':
        setMessage(text);
        break;
      case 'closing':
        setClosing(text);
        break;
    }
    setShowSuggestions(false);
  };

  const getCurrentValue = () => {
    switch (currentField) {
      case 'title':
        return title;
      case 'message':
        return message;
      case 'closing':
        return closing;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 font-serif">
          Test: TextSuggestionPanel
        </h1>
        <p className="text-muted-foreground mb-8">
          Test the text suggestion panel component with different fields
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Editor de Mensagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title">Título</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSuggestions('title')}
                      className="text-xs"
                    >
                      💡 Ver sugestões
                    </Button>
                  </div>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Digite um título..."
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {title.length}/100 caracteres
                  </p>
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="message">Mensagem</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSuggestions('message')}
                      className="text-xs"
                    >
                      💡 Ver sugestões
                    </Button>
                  </div>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    rows={6}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {message.length}/500 caracteres
                  </p>
                </div>

                {/* Closing Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="closing">Fechamento</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSuggestions('closing')}
                      className="text-xs"
                    >
                      💡 Ver sugestões
                    </Button>
                  </div>
                  <Textarea
                    id="closing"
                    value={closing}
                    onChange={(e) => setClosing(e.target.value)}
                    placeholder="Digite uma mensagem de fechamento..."
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">
                    {closing.length}/200 caracteres
                  </p>
                </div>

                {/* Clear All Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setTitle('');
                    setMessage('');
                    setClosing('');
                  }}
                  className="w-full"
                >
                  Limpar Tudo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Suggestion Panel */}
          <div>
            {showSuggestions ? (
              <TextSuggestionPanel
                field={currentField}
                currentValue={getCurrentValue()}
                onSelectSuggestion={handleSelectSuggestion}
                onClose={() => setShowSuggestions(false)}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Clique em "Ver sugestões" ao lado de qualquer campo para ver as opções disponíveis.
                  </p>
                  <div className="space-y-2 text-sm text-left">
                    <p className="font-semibold">Funcionalidades testadas:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Filtrar sugestões por campo (título, mensagem, fechamento)</li>
                      <li>Filtrar sugestões por categoria (romântico, amigável, formal, casual)</li>
                      <li>Inserir sugestão em campo vazio</li>
                      <li>Confirmar substituição quando campo tem conteúdo</li>
                      <li>Editar texto após inserção</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Current Values Display */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Valores Atuais (Debug)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-1">Título:</p>
              <p className="text-sm text-muted-foreground">
                {title || '(vazio)'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Mensagem:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {message || '(vazio)'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Fechamento:</p>
              <p className="text-sm text-muted-foreground">
                {closing || '(vazio)'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
