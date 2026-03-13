/**
 * Unit tests for TemplateSelector component
 * 
 * Tests core functionality:
 * - Template display and selection
 * - Model display and selection
 * - Category filtering
 * - Unsaved changes confirmation
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { TemplateSelector } from '../TemplateSelector'
import { MESSAGE_TEMPLATES } from '@/data/templates'
import { MESSAGE_MODELS } from '@/data/models'

describe('TemplateSelector', () => {
  const mockOnSelectTemplate = vi.fn()
  const mockOnSelectModel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('renders template selector with title', () => {
    render(
      <TemplateSelector
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
        onSelectModel={mockOnSelectModel}
        hasUnsavedChanges={false}
      />
    )

    expect(screen.getByText('Templates')).toBeInTheDocument()
    expect(screen.getByText(/Comece com um template pronto/)).toBeInTheDocument()
  })

  it('displays all category buttons', () => {
    render(
      <TemplateSelector
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
        onSelectModel={mockOnSelectModel}
        hasUnsavedChanges={false}
      />
    )

    expect(screen.getByRole('button', { name: /Filtrar por Aniversário/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Filtrar por Amor/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Filtrar por Amizade/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Filtrar por Gratidão/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Filtrar por Parabéns/i })).toBeInTheDocument()
  })

  it('displays all templates by default', () => {
    render(
      <TemplateSelector
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
        onSelectModel={mockOnSelectModel}
        hasUnsavedChanges={false}
      />
    )

    // Should display all templates
    MESSAGE_TEMPLATES.forEach(template => {
      expect(screen.getByText(template.name)).toBeInTheDocument()
    })
  })

  it('filters templates by category when category is selected', () => {
    render(
      <TemplateSelector
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
        onSelectModel={mockOnSelectModel}
        hasUnsavedChanges={false}
      />
    )

    // Click on "Amor" category
    const amorButton = screen.getByRole('button', { name: /Filtrar por Amor/i })
    fireEvent.click(amorButton)

    // Should only show amor templates
    const amorTemplates = MESSAGE_TEMPLATES.filter(t => t.category === 'amor')
    amorTemplates.forEach(template => {
      expect(screen.getByText(template.name)).toBeInTheDocument()
    })

    // Should not show templates from other categories
    const nonAmorTemplates = MESSAGE_TEMPLATES.filter(t => t.category !== 'amor')
    nonAmorTemplates.forEach(template => {
      expect(screen.queryByText(template.name)).not.toBeInTheDocument()
    })
  })

  it('calls onSelectTemplate when template is clicked', () => {
    render(
      <TemplateSelector
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
        onSelectModel={mockOnSelectModel}
        hasUnsavedChanges={false}
      />
    )

    const firstTemplate = MESSAGE_TEMPLATES[0]
    const templateCard = screen.getByText(firstTemplate.name).closest('div[class*="cursor-pointer"]')
    
    if (templateCard) {
      fireEvent.click(templateCard)
      expect(mockOnSelectTemplate).toHaveBeenCalledWith(firstTemplate.id)
    }
  })

  it('shows confirmation dialog when hasUnsavedChanges is true', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    
    render(
      <TemplateSelector
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
        onSelectModel={mockOnSelectModel}
        hasUnsavedChanges={true}
      />
    )

    const firstTemplate = MESSAGE_TEMPLATES[0]
    const templateCard = screen.getByText(firstTemplate.name).closest('div[class*="cursor-pointer"]')
    
    if (templateCard) {
      fireEvent.click(templateCard)
      expect(confirmSpy).toHaveBeenCalled()
      expect(mockOnSelectTemplate).not.toHaveBeenCalled()
    }
  })

  it('shows models tab when category is selected', () => {
    render(
      <TemplateSelector
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
        onSelectModel={mockOnSelectModel}
        hasUnsavedChanges={false}
      />
    )

    // Click on a category
    const amorButton = screen.getByRole('button', { name: /Filtrar por Amor/i })
    fireEvent.click(amorButton)

    // Should show tabs
    expect(screen.getByText(/Templates \(/)).toBeInTheDocument()
    expect(screen.getByText(/Exemplos \(/)).toBeInTheDocument()
  })

  it('displays models when Exemplos tab is clicked', () => {
    render(
      <TemplateSelector
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
        onSelectModel={mockOnSelectModel}
        hasUnsavedChanges={false}
      />
    )

    // Click on "Amor" category
    const amorButton = screen.getByRole('button', { name: /Filtrar por Amor/i })
    fireEvent.click(amorButton)

    // Click on "Exemplos" tab
    const exemplosTab = screen.getByText(/Exemplos \(/)
    fireEvent.click(exemplosTab)

    // Should show amor models
    const amorModels = MESSAGE_MODELS.filter(m => m.category === 'amor')
    amorModels.forEach(model => {
      expect(screen.getByText(model.name)).toBeInTheDocument()
    })
  })

  it('calls onSelectModel when model is clicked', () => {
    render(
      <TemplateSelector
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
        onSelectModel={mockOnSelectModel}
        hasUnsavedChanges={false}
      />
    )

    // Click on "Amor" category
    const amorButton = screen.getByRole('button', { name: /Filtrar por Amor/i })
    fireEvent.click(amorButton)

    // Click on "Exemplos" tab
    const exemplosTab = screen.getByText(/Exemplos \(/)
    fireEvent.click(exemplosTab)

    // Click on first model
    const firstModel = MESSAGE_MODELS.find(m => m.category === 'amor')
    if (firstModel) {
      const modelCard = screen.getByText(firstModel.name).closest('div[class*="cursor-pointer"]')
      if (modelCard) {
        fireEvent.click(modelCard)
        expect(mockOnSelectModel).toHaveBeenCalledWith(firstModel.id)
      }
    }
  })

  it('highlights selected template', () => {
    const selectedTemplateId = MESSAGE_TEMPLATES[0].id
    
    render(
      <TemplateSelector
        selectedTemplate={selectedTemplateId}
        onSelectTemplate={mockOnSelectTemplate}
        onSelectModel={mockOnSelectModel}
        hasUnsavedChanges={false}
      />
    )

    const selectedCard = screen.getByText(MESSAGE_TEMPLATES[0].name).closest('div[class*="cursor-pointer"]')
    expect(selectedCard).toHaveClass('border-primary')
  })

  it('clears category filter when Limpar Filtro is clicked', () => {
    render(
      <TemplateSelector
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
        onSelectModel={mockOnSelectModel}
        hasUnsavedChanges={false}
      />
    )

    // Click on a category
    const amorButton = screen.getByRole('button', { name: /Filtrar por Amor/i })
    fireEvent.click(amorButton)

    // Should show clear filter button
    const clearButton = screen.getByText('Limpar Filtro')
    expect(clearButton).toBeInTheDocument()

    // Click clear filter
    fireEvent.click(clearButton)

    // Should show all templates again
    expect(screen.queryByText('Limpar Filtro')).not.toBeInTheDocument()
  })
})
