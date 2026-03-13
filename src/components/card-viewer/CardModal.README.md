# CardModal Component

## Overview

The `CardModal` component displays the full content of an opened card in a modal overlay. It provides a rich, immersive experience with photos, music, and special animations for first-time openings.

## Features

- **Full Content Display**: Shows complete card content including title, message, photo, and music
- **Photo Display**: Renders card images with proper styling and loading
- **Automatic Music Playback**: Plays YouTube music automatically on first opening
- **Special First-Open Animation**: Dramatic reveal with falling emojis effect
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Accessibility**: Full keyboard navigation and screen reader support

## Requirements Validation

- ✅ **Requirement 5.5**: Display full card content
- ✅ **Requirement 5.6**: Display photo if available
- ✅ **Requirement 5.7**: Automatic music playback and special animation

## Props

```typescript
interface CardModalProps {
  card: CardType;           // The card to display
  isFirstOpen: boolean;     // Whether this is the first time opening
  onClose: () => void;      // Callback when modal is closed
}
```

## Usage

```tsx
import { CardModal } from '@/components/card-viewer/CardModal';

function MyComponent() {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isFirstOpen, setIsFirstOpen] = useState(false);

  return (
    <>
      {selectedCard && (
        <CardModal
          card={selectedCard}
          isFirstOpen={isFirstOpen}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  );
}
```

## Component Structure

### Header Section
- Gradient background (blue to purple)
- Card number and title
- Heart icon

### Content Section
1. **Photo Display** (if available)
   - Full-width responsive image
   - "Foto especial" badge overlay
   - Lazy loading for performance

2. **Message Text**
   - Styled text box with blue background
   - Preserves line breaks (whitespace-pre-wrap)
   - Large, readable font

3. **Music Player** (if available)
   - YouTube player integration
   - Automatic playback on first open
   - "Música especial" label

4. **Status Messages**
   - First open: Special message with sparkle emojis
   - Already opened: Shows opening date/time

### Special Effects

#### First Opening Animation
1. Modal zooms in (700ms)
2. Falling emojis appear (8 seconds)
3. Content fades in after 800ms delay
4. Music starts playing automatically

#### Subsequent Openings
- Instant content display
- No falling emojis
- No automatic music playback
- Shows previous opening timestamp

## Accessibility Features

- **Keyboard Navigation**: ESC key closes modal
- **ARIA Labels**: Proper dialog role and labels
- **Focus Management**: Traps focus within modal
- **Screen Reader Support**: All interactive elements labeled
- **Color Contrast**: WCAG AA compliant

## Styling

- Uses Tailwind CSS for styling
- Gradient backgrounds for visual appeal
- Rounded corners (rounded-3xl) for modern look
- Shadow effects for depth
- Responsive padding and spacing
- Smooth transitions and animations

## Dependencies

- `@/types/card`: Card type definitions
- `@/components/ui/Button`: Button component
- `@/components/media/YouTubePlayer`: YouTube player
- `@/components/effects/FallingEmojis`: Emoji animation
- `lucide-react`: Icons
- `framer-motion`: Animations (via FallingEmojis)

## Performance Considerations

- **Lazy Loading**: Images load only when needed
- **Conditional Rendering**: Effects only on first open
- **Cleanup**: Proper cleanup of timers and event listeners
- **Body Scroll Lock**: Prevents background scrolling

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- YouTube IFrame API support required for music

## Testing

Test the component with:
1. Cards with all content (photo + music)
2. Cards with only text
3. Cards with only photo
4. Cards with only music
5. First opening vs subsequent openings
6. Mobile and desktop viewports
7. Keyboard navigation (ESC, Tab)
8. Screen reader compatibility

## Known Limitations

- YouTube videos require internet connection
- Some YouTube videos may not be embeddable
- Falling emojis may impact performance on low-end devices
- Modal doesn't support nested scrolling (full height)

## Future Enhancements

- [ ] Add download/share functionality
- [ ] Support for video attachments
- [ ] Custom emoji selection for falling effect
- [ ] Print-friendly version
- [ ] Multiple photo gallery support
- [ ] Audio-only music option (not just YouTube)
