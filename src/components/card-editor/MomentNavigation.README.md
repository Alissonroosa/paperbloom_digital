# MomentNavigation Component

## Overview

The `MomentNavigation` component provides navigation between the 3 thematic moments in the grouped card editor. It displays buttons for each moment with visual indicators of progress and active state.

## Features

- **3 Navigation Buttons**: One for each thematic moment
- **Active Moment Indicator**: Visual highlighting of the current moment
- **Progress Display**: Shows X/4 cards completed for each moment
- **Direct Navigation**: Click any moment to jump directly to it
- **Responsive Layout**: Stacked on mobile, horizontal grid on tablet/desktop
- **Accessibility**: Full keyboard navigation and ARIA labels

## Requirements

Validates the following requirements:
- **7.1**: Display navigation buttons for 3 thematic moments
- **7.2**: Navigate between moments on click
- **7.4**: Visual indicator of active moment
- **9.5**: Display moment progress (X of 3)

## Props

```typescript
interface MomentNavigationProps {
  moments: ThematicMoment[];              // Array of 3 thematic moments
  currentMomentIndex: number;             // Index of active moment (0-2)
  onMomentChange: (index: number) => void; // Callback when moment changes
  completionStatus: Record<number, MomentCompletionStatus>; // Progress for each moment
  className?: string;                     // Optional CSS classes
}
```

## Usage

### Basic Usage

```tsx
import { MomentNavigation } from '@/components/card-editor/MomentNavigation';
import { useThematicMoments } from '@/contexts/CardCollectionEditorContext';

function MyEditor() {
  const {
    moments,
    currentMomentIndex,
    goToMoment,
    getAllMomentsCompletionStatus,
  } = useThematicMoments();

  const completionStatus = getAllMomentsCompletionStatus();

  return (
    <MomentNavigation
      moments={moments}
      currentMomentIndex={currentMomentIndex}
      onMomentChange={goToMoment}
      completionStatus={completionStatus}
    />
  );
}
```

### With Custom Styling

```tsx
<MomentNavigation
  moments={moments}
  currentMomentIndex={currentMomentIndex}
  onMomentChange={goToMoment}
  completionStatus={completionStatus}
  className="mb-6"
/>
```

## Visual States

### Active Moment
- Blue background (`bg-blue-600`)
- White text
- Shadow effect
- White progress bar

### Inactive Moment
- White background
- Gray border
- Gray text
- Blue progress bar

### Complete Moment
- Green checkmark icon
- Green progress badge
- 100% progress bar

### Incomplete Moment
- Gray circle icon
- Gray progress badge
- Partial progress bar

## Responsive Behavior

### Mobile (< 640px)
- Stacked vertical layout
- Full width buttons
- Compact spacing

### Tablet/Desktop (≥ 640px)
- Horizontal 3-column grid
- Equal width buttons
- Larger spacing

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate between moment buttons
- **Enter/Space**: Activate selected moment
- **Arrow Keys**: Navigate between buttons (native button behavior)

### ARIA Attributes
- `aria-label`: Descriptive label with progress info
- `aria-current="step"`: Indicates active moment
- `role="progressbar"`: Progress bar semantics
- `aria-valuenow/min/max`: Progress bar values

### Screen Reader Announcements
- "Momentos Emocionais e de Apoio - 2 de 4 cartas completas"
- "Momento completo" / "Momento incompleto"
- "50% completo" (progress bar)

## Component Structure

```
MomentNavigation
├── Mobile Layout (< 640px)
│   └── Stacked Buttons (flex-col)
│       └── MomentButton (x3)
└── Desktop Layout (≥ 640px)
    └── Grid Layout (grid-cols-3)
        └── MomentButton (x3)

MomentButton
├── Header
│   ├── Moment Number Badge
│   ├── Completion Icon (CheckCircle2 / Circle)
│   └── Progress Badge (X/4)
├── Title
├── Description
└── Progress Bar
```

## Styling

### Colors
- **Active**: Blue (`blue-600`, `blue-700`)
- **Inactive**: Gray (`gray-100`, `gray-300`)
- **Complete**: Green (`green-500`, `green-100`)
- **Progress**: Blue/White gradient

### Spacing
- Mobile: `gap-3` (12px)
- Desktop: `gap-4` (16px)
- Button padding: `p-4` (16px)

### Typography
- Title: `text-sm sm:text-base` (14px/16px)
- Description: `text-xs sm:text-sm` (12px/14px)
- Badge: `text-xs` (12px)

## Integration with Context

The component integrates with `CardCollectionEditorContext`:

```typescript
// Get moments data
const { moments } = useThematicMoments();
// moments = THEMATIC_MOMENTS constant

// Get current moment
const { currentMomentIndex } = useThematicMoments();
// 0, 1, or 2

// Get completion status
const { getAllMomentsCompletionStatus } = useThematicMoments();
const status = getAllMomentsCompletionStatus();
// { 0: { totalCards: 4, completedCards: 2, percentage: 50 }, ... }

// Navigate to moment
const { goToMoment } = useThematicMoments();
goToMoment(1); // Go to moment 2
```

## Testing

### Unit Tests
- Render 3 moment buttons
- Highlight active moment correctly
- Display correct progress for each moment
- Call `onMomentChange` with correct index on click
- Show completion icons appropriately

### Property Tests
- **Property 17**: Active moment indicator is always visible and correct
- For any moment index (0-2), the corresponding button should be highlighted

### Accessibility Tests
- All buttons accessible via keyboard
- ARIA labels present and descriptive
- Progress bars have proper ARIA attributes
- Focus management works correctly

## Performance

- Uses `React.memo` internally for `MomentButton` (implicit via Button component)
- No expensive computations
- Minimal re-renders (only when props change)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires CSS Grid support (all modern browsers)

## Related Components

- `CardGridView`: Displays cards for current moment
- `GroupedCardCollectionEditor`: Parent component that uses MomentNavigation
- `CardCollectionEditorContext`: Provides moment data and navigation functions

## Examples

### Example 1: All Moments Incomplete
```
┌─────────────────────────────────────────────────────────┐
│ [1] ○ 0/4  │ [2] ○ 0/4  │ [3] ○ 0/4                   │
│ Momentos   │ Momentos   │ Momentos                     │
│ Emocionais │ Celebração │ Conflitos                    │
│ ▓░░░░░░░░  │ ░░░░░░░░░  │ ░░░░░░░░░                   │
└─────────────────────────────────────────────────────────┘
```

### Example 2: First Moment Active, Partially Complete
```
┌─────────────────────────────────────────────────────────┐
│ [1] ○ 2/4  │ [2] ○ 0/4  │ [3] ○ 0/4                   │
│ Momentos   │ Momentos   │ Momentos                     │
│ Emocionais │ Celebração │ Conflitos                    │
│ ▓▓▓▓▓░░░░  │ ░░░░░░░░░  │ ░░░░░░░░░                   │
└─────────────────────────────────────────────────────────┘
     ^ACTIVE
```

### Example 3: First Moment Complete, Second Active
```
┌─────────────────────────────────────────────────────────┐
│ [1] ✓ 4/4  │ [2] ○ 1/4  │ [3] ○ 0/4                   │
│ Momentos   │ Momentos   │ Momentos                     │
│ Emocionais │ Celebração │ Conflitos                    │
│ ▓▓▓▓▓▓▓▓▓  │ ▓▓░░░░░░░  │ ░░░░░░░░░                   │
└─────────────────────────────────────────────────────────┘
              ^ACTIVE
```

## Notes

- The component expects exactly 3 moments (as per requirements)
- Progress is calculated based on cards having valid title and message
- Completion status is computed in the context, not in this component
- The component is purely presentational (no business logic)
