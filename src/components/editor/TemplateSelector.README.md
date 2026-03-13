# TemplateSelector Component

## Overview

The `TemplateSelector` component provides a user interface for browsing and selecting message templates and complete message examples (models). It supports category filtering, template/model preview, and handles user confirmation when there are unsaved changes.

## Features

- **Category Filtering**: Filter templates and models by category (Aniversário, Amor, Amizade, Gratidão, Parabéns)
- **Template Display**: Shows template cards with title, description, and preview of content
- **Model Gallery**: Displays complete message examples with all fields populated
- **Unsaved Changes Protection**: Prompts user for confirmation before replacing content
- **Responsive Design**: Adapts to different screen sizes
- **Visual Feedback**: Highlights selected template and provides clear visual hierarchy

## Usage

```tsx
import { TemplateSelector } from '@/components/editor/TemplateSelector'

function EditorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleSelectTemplate = (templateId: string) => {
    const template = getTemplateById(templateId)
    if (template) {
      // Apply template fields to editor state
      setEditorData({
        title: template.fields.title,
        message: template.fields.message,
        closing: template.fields.closing,
        signature: template.fields.signature,
      })
      setSelectedTemplate(templateId)
    }
  }

  const handleSelectModel = (modelId: string) => {
    const model = getModelById(modelId)
    if (model) {
      // Apply complete model data to editor state
      setEditorData({
        title: model.completeData.title,
        message: model.completeData.message,
        closing: model.completeData.closing,
        signature: model.completeData.signature,
        from: model.completeData.from,
        to: model.completeData.to,
        youtubeLink: model.completeData.youtubeLink || '',
      })
    }
  }

  return (
    <TemplateSelector
      selectedTemplate={selectedTemplate}
      onSelectTemplate={handleSelectTemplate}
      onSelectModel={handleSelectModel}
      hasUnsavedChanges={hasUnsavedChanges}
    />
  )
}
```

## Props

### `selectedTemplate: string | null`
The ID of the currently selected template. Used to highlight the selected template in the UI.

### `onSelectTemplate: (templateId: string) => void`
Callback function called when a user selects a template. Receives the template ID as parameter.

### `onSelectModel: (modelId: string) => void`
Callback function called when a user selects a model. Receives the model ID as parameter.

### `hasUnsavedChanges: boolean`
Indicates whether the editor has unsaved changes. When `true`, the component will show a confirmation dialog before applying a new template or model.

## Component Structure

```
TemplateSelector
├── Header (Title + Description)
├── Category Filter Buttons
│   ├── Aniversário
│   ├── Amor
│   ├── Amizade
│   ├── Gratidão
│   └── Parabéns
├── Tab Navigation (when category selected)
│   ├── Templates Tab
│   └── Exemplos Tab
└── Content Grid
    ├── Template Cards (when Templates tab active)
    │   ├── Template Name
    │   ├── Description
    │   ├── Category Badge
    │   ├── Title Preview
    │   ├── Message Preview
    │   └── "Usar Template" Button
    └── Model Cards (when Exemplos tab active)
        ├── Model Name
        ├── Description
        ├── "Exemplo Completo" Badge
        ├── From/To Preview
        ├── Title Preview
        ├── Message Preview
        └── "Usar Exemplo" Button
```

## Behavior

### Category Selection
- Clicking a category button filters templates and models to show only items from that category
- Clicking the same category again deselects it and shows all templates
- A "Limpar Filtro" button appears when a category is selected

### Template vs Model Toggle
- When a category is selected, tabs appear to toggle between templates and models
- Templates show the basic structure with placeholder content
- Models show complete examples with all fields filled

### Selection Confirmation
- If `hasUnsavedChanges` is `true`, clicking a template or model shows a confirmation dialog
- User can confirm to proceed or cancel to keep current content
- If `hasUnsavedChanges` is `false`, selection happens immediately

### Visual Feedback
- Selected template has a primary-colored border
- Hover effects on cards provide visual feedback
- Category buttons change appearance when selected
- Scrollable content area with max height for better UX

## Data Sources

The component uses data from:
- `@/data/templates` - Template definitions
- `@/data/models` - Complete message examples

## Styling

The component uses Tailwind CSS classes and follows the Paper Bloom design system:
- Primary color for selected states and important actions
- Secondary color for model-specific elements
- Muted colors for descriptions and secondary text
- Rounded corners and shadows for cards
- Responsive grid layout

## Testing

### Manual Testing
Visit `/editor/test-template-selector` to manually test the component with:
- Category filtering
- Template selection
- Model selection
- Unsaved changes simulation
- Visual feedback

### Verification Script
Run the verification script to check data integrity:
```bash
npx ts-node --project tsconfig.node.json src/components/editor/__tests__/verify-template-selector.ts
```

## Requirements Validation

This component satisfies the following requirements from the spec:

- **Requirement 7.1**: Provides at least 5 template options (10 templates across 5 categories)
- **Requirement 7.2**: Populates all fields with template-specific content when selected
- **Requirement 7.3**: All populated fields remain editable (handled by parent component)
- **Requirement 7.4**: Displays template previews before selection
- **Requirement 7.5**: Preserves user data with confirmation dialog when switching templates
- **Requirement 8.1**: Provides at least 3 complete message examples per category (15 models total)
- **Requirement 8.2**: Displays full preview of example messages
- **Requirement 8.3**: Populates all editor fields with model content when selected
- **Requirement 8.4**: Allows customization of selected model (handled by parent component)
- **Requirement 8.5**: Clearly indicates models are starting points for customization

## Future Enhancements

Potential improvements for future iterations:
- Search functionality for templates and models
- Favorite/bookmark templates
- User-created custom templates
- Template preview modal with full content
- Drag-and-drop template organization
- Template usage analytics
