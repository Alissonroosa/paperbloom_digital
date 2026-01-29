# Step5ThemeCustomization Component

## Overview

The `Step5ThemeCustomization` component is the fifth step in the multi-step wizard, allowing users to customize the visual theme of their message. It provides an intuitive interface for selecting background colors, themes, and validates contrast for accessibility.

## Features

### 1. Predefined Background Colors
- **8 Color Options**: Rosa Suave, Azul Céu, Verde Menta, Lavanda, Pêssego, Amarelo Claro, Cinza Claro, Branco
- **Visual Selection**: Large color swatches with hover effects
- **Active State**: Selected color shows a checkmark indicator
- **Accessible**: Proper ARIA labels and keyboard navigation

### 2. Custom Color Picker
- **Expandable Section**: Toggle to show/hide custom color picker
- **Dual Input**: Native color picker and hex code input
- **Real-time Validation**: Validates hex color format
- **Visual Feedback**: Shows current custom color

### 3. Theme Selection
- **3 Theme Options**:
  - **Light**: Dark text on light background
  - **Dark**: Light text on dark background
  - **Gradient**: Text on gradient background
- **Visual Previews**: Each theme shows a mini preview
- **Descriptive**: Clear descriptions for each theme option

### 4. Contrast Validation
- **Automatic Validation**: Checks contrast ratio on every change
- **WCAG AA Compliance**: Ensures 4.5:1 minimum contrast ratio
- **Warning Display**: Shows warning when contrast is insufficient
- **Helpful Suggestions**: Recommends adjustments for better contrast

### 5. Real-time Preview Updates
- **Immediate Feedback**: Changes apply instantly to preview
- **Synchronized State**: Uses wizard context for state management
- **Visual Confirmation**: Preview note reminds users to check preview

## Props

This component uses the Wizard Context and doesn't accept props directly.

### Context Values Used
- `data.backgroundColor`: Current background color (hex)
- `data.theme`: Current theme ('light' | 'dark' | 'gradient')
- `data.customColor`: Custom color if selected (hex or null)
- `updateField`: Function to update wizard state

## Usage

```tsx
import { Step5ThemeCustomization } from '@/components/wizard/steps/Step5ThemeCustomization';

// Used within the wizard flow
<Step5ThemeCustomization />
```

## Accessibility

### ARIA Attributes
- `aria-label`: Descriptive labels for color buttons
- `aria-pressed`: Indicates selected state for buttons
- `aria-expanded`: Shows custom picker expansion state
- `aria-controls`: Links toggle button to picker section
- `role="alert"`: Announces contrast warnings
- `aria-live="polite"`: Live region for contrast updates

### Keyboard Navigation
- All color swatches are keyboard accessible
- Tab navigation through all interactive elements
- Focus indicators on all buttons and inputs
- Enter/Space to select colors and themes

### Screen Reader Support
- Descriptive labels for all interactive elements
- Status announcements for contrast warnings
- Clear indication of selected states

## Validation

### Contrast Validation
The component automatically validates contrast using the `validateContrast` utility:

```typescript
const result = validateContrast(backgroundColor, theme);
// Returns: { isValid: boolean; warning?: string }
```

**WCAG AA Requirements:**
- Minimum contrast ratio: 4.5:1
- Validates against text color based on theme
- Light theme: Black text (#000000)
- Dark theme: White text (#FFFFFF)

### Color Format Validation
- Hex color format: `#RRGGBB`
- Validates input in real-time
- Prevents invalid characters

## State Management

### Local State
- `showCustomPicker`: Controls custom picker visibility
- `contrastWarning`: Stores current contrast warning message

### Wizard State (via Context)
- `backgroundColor`: Selected background color
- `theme`: Selected theme option
- `customColor`: Custom color value (if used)

## Styling

### Tailwind Classes
- Responsive grid layouts
- Hover and focus states
- Smooth transitions
- Color-coded warnings (orange for contrast issues)

### Color Swatches
- 4-column grid on all screen sizes
- 16px height (h-16)
- Border highlights for selection
- Scale animation on hover

### Theme Cards
- 1 column on mobile, 3 columns on desktop
- Visual preview of each theme
- Active state with primary color border

## Integration

### With Wizard Context
```typescript
const { data, updateField } = useWizard();

// Update background color
updateField('backgroundColor', '#FFE4E1');

// Update theme
updateField('theme', 'dark');

// Update custom color
updateField('customColor', '#FF5733');
```

### With Preview Panel
The preview panel automatically reflects changes:
- Background color updates
- Theme style changes
- Text color adjustments based on contrast

## Requirements Satisfied

This component satisfies the following requirements:

- **6.1**: Display at least 8 background color options ✓
- **6.2**: Display at least 3 theme options (Light, Dark, Gradient) ✓
- **6.3**: Apply color/theme to preview immediately ✓
- **6.4**: Provide custom color picker ✓
- **6.5**: Ensure text readability with contrast validation ✓

## Testing

### Unit Tests
Test file: `__tests__/Step5ThemeCustomization.test.tsx`

**Test Cases:**
1. Renders all 8 predefined colors
2. Renders all 3 theme options
3. Handles color selection
4. Handles theme selection
5. Shows/hides custom color picker
6. Validates custom hex color input
7. Displays contrast warnings
8. Updates wizard context on changes

### Integration Tests
1. Color selection updates preview
2. Theme selection updates preview
3. Custom color updates preview
4. Contrast validation triggers warnings
5. Navigation preserves selections

## Performance

### Optimizations
- `useEffect` with dependencies for contrast validation
- Debounced color input validation
- Minimal re-renders with context updates

### Considerations
- Contrast calculation runs on every color/theme change
- Custom color picker only renders when expanded
- Color swatches use CSS for visual display (no images)

## Future Enhancements

### Potential Improvements
1. **Color Palette Presets**: Themed color combinations
2. **Gradient Customization**: Custom gradient angles and colors
3. **Color History**: Recently used colors
4. **Accessibility Score**: Visual indicator of contrast quality
5. **Color Blindness Simulation**: Preview for different vision types
6. **Save Favorites**: Save custom color combinations

## Related Components

- `WizardContext`: Provides state management
- `Label`: Form labels
- `Button`: Action buttons
- `PreviewPanel`: Shows real-time preview of changes

## Related Utilities

- `validateContrast()`: Validates WCAG contrast ratios
- `calculateContrastRatio()`: Calculates contrast between colors
- `BACKGROUND_COLORS`: Predefined color options
- `THEME_OPTIONS`: Theme configuration

## Notes

### Design Decisions
1. **8 Colors**: Provides variety without overwhelming users
2. **Visual Swatches**: Easier to choose than color names
3. **Expandable Custom Picker**: Keeps interface clean for most users
4. **Inline Warnings**: Immediate feedback on contrast issues
5. **Theme Previews**: Helps users understand theme effects

### Accessibility Considerations
1. **Contrast Validation**: Ensures WCAG AA compliance
2. **Keyboard Navigation**: All features accessible via keyboard
3. **Screen Reader Support**: Comprehensive ARIA labels
4. **Visual Indicators**: Multiple ways to identify selection
5. **Warning Announcements**: Live regions for dynamic content
