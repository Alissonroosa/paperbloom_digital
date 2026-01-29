# PreviewPanel Component

## Overview

The `PreviewPanel` component provides a real-time preview of the message being created in the wizard. It supports two view modes (Card and Cinema) and adapts to different screen sizes with a sticky desktop layout and a floating mobile button.

## Features

- **Dual View Modes**: Toggle between Card (static) and Cinema (animated) previews
- **Real-Time Updates**: Reflects changes within 300ms of user input
- **Responsive Design**: 
  - Desktop: Sticky sidebar preview
  - Mobile: Floating button with full-screen modal
- **View Mode Persistence**: Selected view mode is maintained across step navigation
- **Touch-Friendly**: Minimum 44x44px touch targets for mobile

## Props

```typescript
interface PreviewPanelProps {
  data: WizardFormData;           // Form data to preview
  uploads: WizardUploadStates;    // Upload states with URLs
  viewMode: 'card' | 'cinema';    // Current view mode
  onViewModeChange: (mode: 'card' | 'cinema') => void;  // View mode change handler
  className?: string;              // Optional additional classes
}
```

## Usage

### With Wizard Context

```tsx
import { PreviewPanel } from '@/components/wizard/PreviewPanel';
import { useWizard } from '@/contexts/WizardContext';

function WizardPage() {
  const { data, uploads, ui, updateUIState } = useWizard();

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        {/* Wizard steps */}
      </div>
      
      <PreviewPanel
        data={data}
        uploads={uploads}
        viewMode={ui.previewMode}
        onViewModeChange={(mode) => updateUIState({ previewMode: mode })}
      />
    </div>
  );
}
```

### Standalone Usage

```tsx
import { PreviewPanel } from '@/components/wizard/PreviewPanel';
import { useState } from 'react';

function PreviewExample() {
  const [viewMode, setViewMode] = useState<'card' | 'cinema'>('card');
  
  const data = {
    pageTitle: 'Feliz Aniversário',
    recipientName: 'Maria',
    senderName: 'João',
    mainMessage: 'Desejo tudo de melhor!',
    // ... other fields
  };
  
  const uploads = {
    mainImage: { url: '/image.jpg', isUploading: false, error: null },
    galleryImages: [],
  };

  return (
    <PreviewPanel
      data={data}
      uploads={uploads}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  );
}
```

## View Modes

### Card View
- Static card layout
- Shows main image, message, sender/recipient names
- Displays music player if YouTube link is provided
- Optimized for quick preview

### Cinema View
- Full animated cinematic experience
- Shows the complete message flow
- Includes photo gallery, animations, and transitions
- Displays in "full-view" stage for preview purposes

## Responsive Behavior

### Desktop (≥1024px)
- Sticky positioning in sidebar
- Always visible while scrolling
- Toggle buttons with icons and labels
- 600px minimum height

### Mobile (<1024px)
- Floating action button in bottom-right corner
- Full-screen modal when opened
- Touch-optimized controls (44x44px minimum)
- Scrollable content area

## Performance

- **Update Debouncing**: Changes are debounced to prevent excessive re-renders
- **Update Timing**: Preview updates within 300ms of data changes
- **Key-Based Re-rendering**: Uses update key to force re-render when needed
- **Cleanup**: Properly cleans up timeouts on unmount

## Accessibility

- **ARIA Labels**: All interactive elements have descriptive labels
- **ARIA Pressed**: Toggle buttons indicate their pressed state
- **Keyboard Navigation**: All controls are keyboard accessible
- **Touch Targets**: Minimum 44x44px for mobile interactions
- **Screen Reader Support**: Preview regions are properly labeled

## Requirements Validation

This component satisfies the following requirements:

- **9.1**: Updates preview within 300ms of field changes
- **9.2**: Maintains preview visibility on desktop (min-width 1024px)
- **9.3**: Provides preview button on mobile/tablet screens
- **9.4**: Reflects all customizations in real-time
- **9.5**: Displays placeholder content for empty fields
- **10.1**: Provides toggle control with Card/Cinema options
- **10.2**: Displays static card layout in Card view
- **10.3**: Displays animated cinematic sequence in Cinema view
- **10.4**: Preserves selected view mode across navigation
- **10.5**: Defaults to Card view on initial load

## Testing

### Unit Tests
```bash
npm test -- PreviewPanel.test.tsx
```

### Integration Tests
```bash
npm test -- PreviewPanel.integration.test.tsx
```

## Related Components

- `Preview`: Card view component
- `CinematicPreview`: Cinema view component
- `WizardContext`: State management
- `useWizard`: Hook for accessing wizard state

## Notes

- The preview automatically updates when wizard data changes
- View mode preference is stored in wizard UI state
- Mobile modal uses fixed positioning to overlay the entire screen
- Desktop preview uses sticky positioning to stay visible while scrolling
