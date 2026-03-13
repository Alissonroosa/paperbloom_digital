"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { 
  MESSAGE_TEMPLATES, 
  MessageTemplate, 
  TemplateCategory,
  getAllCategories 
} from "@/data/templates"
import { 
  MESSAGE_MODELS, 
  MessageModel,
  getModelsByCategory 
} from "@/data/models"
import { Heart, Cake, Users, Gift, Trophy, ChevronRight, Sparkles } from "lucide-react"

interface TemplateSelectorProps {
  selectedTemplate: string | null
  onSelectTemplate: (templateId: string) => void
  onSelectModel: (modelId: string) => void
  hasUnsavedChanges: boolean
}

const categoryIcons: Record<TemplateCategory, React.ReactNode> = {
  aniversario: <Cake className="w-5 h-5" />,
  amor: <Heart className="w-5 h-5" />,
  amizade: <Users className="w-5 h-5" />,
  gratidao: <Gift className="w-5 h-5" />,
  parabens: <Trophy className="w-5 h-5" />,
}

const categoryLabels: Record<TemplateCategory, string> = {
  aniversario: 'Aniversário',
  amor: 'Amor',
  amizade: 'Amizade',
  gratidao: 'Gratidão',
  parabens: 'Parabéns',
}

export function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
  onSelectModel,
  hasUnsavedChanges,
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null)
  const [showModels, setShowModels] = useState(false)

  const categories = getAllCategories()
  const templates = selectedCategory 
    ? MESSAGE_TEMPLATES.filter(t => t.category === selectedCategory)
    : MESSAGE_TEMPLATES

  const models = selectedCategory ? getModelsByCategory(selectedCategory) : []

  const handleTemplateClick = (template: MessageTemplate) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'Você tem alterações não salvas. Deseja substituir com este template?'
      )
      if (!confirmed) return
    }
    
    onSelectTemplate(template.id)
    setShowModels(false)
  }

  const handleModelClick = (model: MessageModel) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'Você tem alterações não salvas. Deseja substituir com este modelo?'
      )
      if (!confirmed) return
    }
    
    onSelectModel(model.id)
    setShowModels(false)
  }

  const handleCategoryClick = (category: TemplateCategory) => {
    if (selectedCategory === category) {
      setSelectedCategory(null)
      setShowModels(false)
    } else {
      setSelectedCategory(category)
      setShowModels(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-text-main flex items-center gap-2">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" aria-hidden="true" />
          Templates
        </h2>
        <p className="text-sm text-muted-foreground">
          Comece com um template pronto ou veja exemplos completos.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar templates por categoria">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "primary" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(category)}
            className="flex items-center gap-2 min-h-[44px]"
            aria-pressed={selectedCategory === category}
            aria-label={`Filtrar por ${categoryLabels[category]}`}
          >
            <span aria-hidden="true">{categoryIcons[category]}</span>
            {categoryLabels[category]}
          </Button>
        ))}
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategory(null)
              setShowModels(false)
            }}
            className="min-h-[44px]"
            aria-label="Limpar filtro de categoria"
          >
            Limpar Filtro
          </Button>
        )}
      </div>

      {/* Toggle between Templates and Models */}
      {selectedCategory && (
        <div className="flex gap-2 border-b" role="tablist" aria-label="Escolher entre templates e exemplos">
          <button
            role="tab"
            aria-selected={!showModels}
            aria-controls="template-panel"
            className={`px-4 py-2 min-h-[44px] text-sm font-medium transition-colors ${
              !showModels
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-text-main'
            }`}
            onClick={() => setShowModels(false)}
          >
            Templates ({templates.length})
          </button>
          <button
            role="tab"
            aria-selected={showModels}
            aria-controls="models-panel"
            className={`px-4 py-2 min-h-[44px] text-sm font-medium transition-colors ${
              showModels
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-text-main'
            }`}
            onClick={() => setShowModels(true)}
          >
            Exemplos ({models.length})
          </button>
        </div>
      )}

      {/* Templates Grid - Horizontal Scroll */}
      {!showModels && (
        <div 
          id="template-panel"
          role="tabpanel"
          aria-label="Lista de templates"
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin' }}
        >
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 flex-shrink-0 w-[320px] snap-start ${
                selectedTemplate === template.id ? 'border-primary border-2' : ''
              }`}
              onClick={() => handleTemplateClick(template)}
              role="button"
              tabIndex={0}
              aria-label={`Template: ${template.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTemplateClick(template);
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {categoryIcons[template.category]}
                      {template.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2 flex-shrink-0">
                    {categoryLabels[template.category]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="font-medium text-primary mb-1">Título:</p>
                    <p className="text-muted-foreground line-clamp-1">
                      {template.fields.title}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="font-medium text-primary mb-1">Mensagem:</p>
                    <p className="text-muted-foreground line-clamp-2">
                      {template.fields.message}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 flex items-center justify-center gap-2 min-h-[44px]"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTemplateClick(template)
                  }}
                  aria-label={`Usar template ${template.name}`}
                >
                  Usar Template
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Models Grid - Horizontal Scroll */}
      {showModels && selectedCategory && (
        <div 
          id="models-panel"
          role="tabpanel"
          aria-label="Lista de exemplos"
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin' }}
        >
          {models.map((model) => (
            <Card
              key={model.id}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 flex-shrink-0 w-[320px] snap-start"
              onClick={() => handleModelClick(model)}
              role="button"
              tabIndex={0}
              aria-label={`Exemplo: ${model.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleModelClick(model);
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {model.description}
                    </CardDescription>
                  </div>
                  <Badge className="ml-2 flex-shrink-0">Exemplo Completo</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-secondary/5 rounded-lg">
                    <p className="font-medium text-secondary mb-1">De/Para:</p>
                    <p className="text-muted-foreground">
                      De: {model.completeData.from} → Para: {model.completeData.to}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/5 rounded-lg">
                    <p className="font-medium text-secondary mb-1">Título:</p>
                    <p className="text-muted-foreground line-clamp-1">
                      {model.completeData.title}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/5 rounded-lg">
                    <p className="font-medium text-secondary mb-1">Mensagem:</p>
                    <p className="text-muted-foreground line-clamp-3">
                      {model.completeData.message}
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mt-4 flex items-center justify-center gap-2 min-h-[44px]"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleModelClick(model)
                  }}
                  aria-label={`Usar exemplo ${model.name}`}
                >
                  Usar Exemplo
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {templates.length === 0 && !showModels && (
        <div className="text-center py-12" role="status">
          <p className="text-muted-foreground">
            Nenhum template encontrado para esta categoria.
          </p>
        </div>
      )}

      {showModels && models.length === 0 && (
        <div className="text-center py-12" role="status">
          <p className="text-muted-foreground">
            Nenhum exemplo encontrado para esta categoria.
          </p>
        </div>
      )}
    </div>
  )
}
