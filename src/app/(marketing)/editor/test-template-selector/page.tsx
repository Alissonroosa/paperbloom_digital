"use client"

import { useState } from "react"
import { TemplateSelector } from "@/components/editor/TemplateSelector"
import { getTemplateById } from "@/data/templates"
import { getModelById } from "@/data/models"

/**
 * Test page for TemplateSelector component
 * 
 * This page allows manual testing of:
 * - Template display and selection
 * - Model display and selection
 * - Category filtering
 * - Unsaved changes confirmation
 */
export default function TestTemplateSelectorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [appliedData, setAppliedData] = useState<any>(null)

  const handleSelectTemplate = (templateId: string) => {
    const template = getTemplateById(templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setAppliedData({
        type: 'template',
        id: templateId,
        name: template.name,
        fields: template.fields,
      })
      setHasUnsavedChanges(false)
    }
  }

  const handleSelectModel = (modelId: string) => {
    const model = getModelById(modelId)
    if (model) {
      setSelectedModel(modelId)
      setAppliedData({
        type: 'model',
        id: modelId,
        name: model.name,
        completeData: model.completeData,
      })
      setHasUnsavedChanges(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-text-main mb-2">
            TemplateSelector Test Page
          </h1>
          <p className="text-muted-foreground">
            Test the TemplateSelector component functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: TemplateSelector */}
          <div>
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
              onSelectModel={handleSelectModel}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </div>

          {/* Right: Applied Data Display */}
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border">
              <h2 className="text-2xl font-serif font-bold text-text-main mb-4">
                Applied Data
              </h2>
              
              {appliedData ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type:</p>
                    <p className="text-lg font-semibold capitalize">{appliedData.type}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name:</p>
                    <p className="text-lg font-semibold">{appliedData.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID:</p>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">{appliedData.id}</p>
                  </div>

                  {appliedData.type === 'template' && appliedData.fields && (
                    <div className="space-y-3 pt-4 border-t">
                      <h3 className="font-semibold">Template Fields:</h3>
                      
                      <div>
                        <p className="text-sm font-medium text-primary">Title:</p>
                        <p className="text-sm">{appliedData.fields.title}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-primary">Message:</p>
                        <p className="text-sm">{appliedData.fields.message}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-primary">Closing:</p>
                        <p className="text-sm">{appliedData.fields.closing}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-primary">Signature:</p>
                        <p className="text-sm">{appliedData.fields.signature}</p>
                      </div>
                    </div>
                  )}

                  {appliedData.type === 'model' && appliedData.completeData && (
                    <div className="space-y-3 pt-4 border-t">
                      <h3 className="font-semibold">Model Complete Data:</h3>
                      
                      <div>
                        <p className="text-sm font-medium text-secondary">From:</p>
                        <p className="text-sm">{appliedData.completeData.from}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-secondary">To:</p>
                        <p className="text-sm">{appliedData.completeData.to}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-secondary">Title:</p>
                        <p className="text-sm">{appliedData.completeData.title}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-secondary">Message:</p>
                        <p className="text-sm">{appliedData.completeData.message}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-secondary">Closing:</p>
                        <p className="text-sm">{appliedData.completeData.closing}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-secondary">Signature:</p>
                        <p className="text-sm">{appliedData.completeData.signature}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Select a template or model to see the applied data
                </p>
              )}
            </div>

            {/* Test Controls */}
            <div className="p-6 bg-white rounded-xl shadow-sm border">
              <h2 className="text-2xl font-serif font-bold text-text-main mb-4">
                Test Controls
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasUnsavedChanges}
                      onChange={(e) => setHasUnsavedChanges(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Simulate unsaved changes</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    When enabled, selecting a template/model will show a confirmation dialog
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      setSelectedTemplate(null)
                      setSelectedModel(null)
                      setAppliedData(null)
                      setHasUnsavedChanges(false)
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
