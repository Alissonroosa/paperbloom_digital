# TextSuggestionPanel Component

## Overview

The `TextSuggestionPanel` component provides a user interface for browsing and selecting pre-written text suggestions for different message fields. It helps users overcome creative blocks by offering categorized suggestions that can be inserted and customized.

## Features

- **Field-Specific Suggestions**: Displays suggestions filtered by field type (title, message, closing)
- **Category Filtering**: Allows users to filter suggestions by category (Romântico, Amigável, Formal, Casual)
- **Smart Insertion**: Inserts suggestions directly into empty fields
- **Replace Confirmation**: Asks for confirmation before replacing existing content
- **Editable Results**: All inserted text remains fully editable
- **Tag Display**: Shows relevant tags for each suggestion
- **Responsive Design**: Works well on different screen sizes

## Requirements Validation

This component satisfies the following requirements:

- **Requirement 9.4**: Implements suggestion selection handler that inserts text into corresponding field
- **Requirement 9.5**: Organizes suggestions by category (Romântico, Amigável, Formal, Casual)
- **Requirement 9.6**: Ensures inserted text remains editable and asks for confirmation when replacing existing content

## Usage

```tsx
import { TextSuggestionPanel } from '@/components/editor/TextSuggestionPanel';
import { SuggestionField } from '@/data/suggestions';

function MyEditor() {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentField, setCurrentField] = useState<SuggestionField>('title');
  const [title, setTitle] = useState('');

  const handleSelectSuggestion = (text: string) => {
    setTitle(text);
    setShowSuggestions(false);
  };

  return (
    <>
      <button onClick={() => setShowSuggestions(true)}>
        Ver Sugestões
      </button>
      
      {showSuggestions && (
        <TextSuggestionPanel
          field={currentField}
          currentValue={title}
          onSelectSuggestion={handleSelectSuggestion}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </>
  );
}
```

## Props

### `field: SuggestionField`
The field type for which to display suggestions. Can be:
- `'title'` - Title suggestions
- `'message'` - Message suggestions
- `'closing'` - Closing message suggestions

### `currentValue: string`
The current value of the field. Used to determine if confirmation is needed before replacing content.

### `onSelectSuggestion: (text: string) => void`
Callback function called when a user selects a suggestion. Receives the suggestion text as a parameter.

### `onClose: () => void`
Callback function called when the user closes the panel.

## Component Behavior

### Empty Field
When the field is empty (`currentValue` is empty or whitespace):
1. User clicks "Usar esta sugestão"
2. Suggestion text is immediately inserted via `onSelectSuggestion`
3. Panel remains open for additional selections

### Field with Content
When the field already has content:
1. User clicks "Usar esta sugestão"
2. Confirmation UI appears asking "Substituir o texto atual por esta sugestão?"
3. User can confirm ("Sim, substituir") or cancel
4. If confirmed, suggestion replaces existing content
5. If cancelled, original content remains unchanged

### Category Filtering
- Four category buttons at the top: Romântico, Amigável, Formal, Casual
- Clicking a category filters suggestions to show only that category
- Active category is highlighted with primary styling
- Suggestions update immediately when category changes

## Styling

The component uses:
- Card component for container
- Button component for actions and category filters
- Badge component for suggestion tags
- Tailwind CSS for layout and styling
- Smooth transitions for hover and active states

## Testing

A test page is available at `/editor/test-suggestion-panel` that allows testing:
- Suggestion filtering by field
- Suggestion filtering by category
- Insertion into empty fields
- Confirmation when replacing content
- Editability of inserted text

## Data Source

Suggestions are loaded from `@/data/suggestions.ts` which provides:
- `TEXT_SUGGESTIONS` - Array of all suggestions
- `getSuggestionsByFieldAndCategory()` - Filter function
- `getAllSuggestionCategories()` - List of available categories

## Accessibility

- Close button has `aria-label` for screen readers
- Keyboard navigation supported through standard button elements
- Clear visual feedback for active category
- Readable text contrast ratios

## Future Enhancements

Potential improvements:
- Search/filter suggestions by keyword
- Favorite/bookmark suggestions
- Custom user-created suggestions
- Suggestion preview before insertion
- Keyboard shortcuts for quick insertion
