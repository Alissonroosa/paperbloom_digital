# Step 6: Music Selection Component

## Overview

The `Step6MusicSelection` component is the sixth step in the multi-step wizard, allowing users to add background music from YouTube to their message. This step is optional and provides a rich music selection experience with URL validation, video ID extraction, and a preview player.

## Features

### 1. YouTube URL Input
- Text input field for YouTube video URLs
- Real-time validation of URL format
- Support for multiple YouTube URL formats:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`
- Clear button to remove the URL

### 2. URL Validation
- Validates that the URL is from YouTube domain
- Extracts video ID using `extractYouTubeVideoId` utility
- Displays error messages for invalid URLs
- Shows success message with extracted video ID

### 3. Music Start Time Slider
- Range slider from 0 to 300 seconds (5 minutes)
- 5-second step increments
- Visual time markers at 1-minute intervals
- Formatted time display (MM:SS)
- Only visible when a valid URL is entered

### 4. Music Preview Player
- Embedded YouTube iframe player
- Automatically starts at the selected time
- Full video controls available
- Responsive aspect ratio (16:9)
- Only visible when a valid URL is entered

### 5. Optional Skip
- Clear messaging that music is optional
- Information box explaining the optional nature
- Easy way to skip by leaving the URL empty

### 6. User Guidance
- Tips for choosing appropriate music
- Copyright notice and disclaimer
- Format examples for YouTube URLs
- Explanation of start time functionality

## Component Structure

```tsx
<Step6MusicSelection>
  ├── Header (Title and Description)
  ├── YouTube URL Input
  │   ├── Input Field
  │   ├── Clear Button
  │   ├── Validation Feedback (Error/Success)
  │   └── Format Examples
  ├── Music Start Time Slider (conditional)
  │   ├── Time Display
  │   ├── Range Slider
  │   └── Time Markers
  ├── Music Preview Player (conditional)
  │   └── YouTube Iframe Embed
  ├── Skip Option Info (conditional)
  ├── Tips Information Box
  └── Copyright Notice
</Step6MusicSelection>
```

## State Management

The component uses the `useWizard` hook to access and update wizard state:

- `data.youtubeUrl`: The YouTube video URL
- `data.musicStartTime`: The start time in seconds (0-300)

Local state:
- `urlError`: Error message for invalid URLs
- `videoId`: Extracted YouTube video ID
- `isValidUrl`: Boolean indicating if URL is valid

## Validation

### URL Validation
1. Empty URLs are considered valid (optional field)
2. Non-empty URLs must match YouTube domain pattern
3. Video ID must be extractable from the URL
4. Video ID must be 11 characters (YouTube standard)

### Start Time Validation
- Minimum: 0 seconds
- Maximum: 300 seconds (5 minutes)
- Step: 5 seconds

## Accessibility

- Proper ARIA labels on all interactive elements
- `aria-invalid` on input when there's an error
- `aria-describedby` linking input to error message
- `role="alert"` on error messages
- Slider has proper ARIA attributes:
  - `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
  - `aria-valuetext` with formatted time
  - `aria-label` describing the control
- Keyboard navigation support
- Focus indicators on all interactive elements

## Usage Example

```tsx
import { Step6MusicSelection } from '@/components/wizard/steps/Step6MusicSelection';

function WizardPage() {
  return (
    <WizardProvider>
      <Step6MusicSelection />
    </WizardProvider>
  );
}
```

## Requirements Satisfied

This component satisfies the following requirements from the specification:

- **7.1**: Display field for YouTube URL input ✓
- **7.2**: Validate that entered URL is a valid YouTube link ✓
- **7.3**: Extract video ID from various YouTube URL formats ✓
- **7.4**: Provide slider to select music start time (0-300 seconds) ✓
- **7.5**: Allow users to optionally skip music selection ✓
- **7.6**: Display music player preview when YouTube link is valid ✓

## Testing

The component should be tested for:

1. **URL Validation**:
   - Valid YouTube URLs are accepted
   - Invalid URLs show error messages
   - Empty URLs are accepted (optional)
   - Video ID is correctly extracted

2. **Start Time Slider**:
   - Only visible with valid URL
   - Range is 0-300 seconds
   - Value updates correctly
   - Time is formatted properly

3. **Preview Player**:
   - Only visible with valid URL
   - Iframe src includes correct video ID
   - Start time parameter is included
   - Player is responsive

4. **Accessibility**:
   - Keyboard navigation works
   - Screen readers can access all content
   - ARIA attributes are correct
   - Focus management is proper

## Related Files

- `src/types/wizard.ts` - Wizard state types and validation schemas
- `src/contexts/WizardContext.tsx` - Wizard context provider
- `src/lib/wizard-utils.ts` - YouTube URL utilities
- `src/components/ui/Input.tsx` - Input component
- `src/components/ui/Label.tsx` - Label component
- `src/components/ui/Button.tsx` - Button component

## Notes

- Music selection is completely optional
- The component validates URLs in real-time
- The preview player allows users to test the music before proceeding
- Start time helps skip long intros or find the perfect moment
- Copyright notice reminds users of their responsibilities
