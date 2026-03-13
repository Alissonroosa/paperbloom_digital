# CinematicPreview Component

## Overview

The `CinematicPreview` component provides a full cinematic experience for displaying personalized messages. It implements a multi-stage animated sequence that guides the viewer through an emotional journey, from introduction to the full message reveal.

## Features

- **12 Stage Sequence**: Implements all preview stages from intro to full-view
- **Automatic Transitions**: Stages automatically progress with configurable timing
- **Typewriter Effects**: Animated text reveal for messages and titles
- **Photo Reveal Animation**: Smooth blur-to-focus transition for main image
- **Gallery Display**: Grid layout for up to 3 additional photos
- **Music Integration**: Audio playback with fade-in and controls
- **Date Formatting**: Portuguese date formatting for special occasions
- **Restart Functionality**: Allows users to replay the experience
- **Responsive Design**: Adapts to mobile and desktop screens

## Stage Flow

```
intro-1 → intro-2 → intro-action → transition → reveal-photo → 
reveal-intro → reveal-message → reading → closing-1 → 
closing-2 → final → full-view
```

### Stage Descriptions

1. **intro-1**: Displays the message title
2. **intro-2**: Shows a welcoming message
3. **intro-action**: Interactive button to start the experience
4. **transition**: Brief transition with music fade-in
5. **reveal-photo**: Main photo appears with blur effect
6. **reveal-intro**: Greeting text with typewriter effect
7. **reveal-message**: Main message with typewriter effect
8. **reading**: Message display with continue button
9. **closing-1**: First closing message
10. **closing-2**: Second closing message
11. **final**: Final screen with action buttons
12. **full-view**: Complete rich content view with all elements

## Props

```typescript
interface CinematicPreviewProps {
    data: {
        title: string;              // Message title (displayed in intro)
        specialDate: Date | null;   // Special occasion date
        mainImage: string | null;   // Main photo URL
        galleryImages: string[];    // Array of gallery photo URLs (max 3)
        from: string;               // Sender name
        to: string;                 // Recipient name
        message: string;            // Main message text
        signature: string;          // Custom signature
        closing: string;            // Closing message
        youtubeLink: string;        // YouTube audio URL
    };
    stage?: PreviewStage;           // Controlled stage (optional)
    onStageChange?: (stage: PreviewStage) => void;  // Stage change callback
    autoPlay?: boolean;             // Auto-start sequence (default: false)
}
```

## Usage

### Basic Usage (Uncontrolled)

```tsx
import { CinematicPreview } from '@/components/editor/CinematicPreview';

function EditorPage() {
    const messageData = {
        title: "Feliz Aniversário!",
        specialDate: new Date('2024-11-23'),
        mainImage: "/uploads/photo.jpg",
        galleryImages: ["/uploads/1.jpg", "/uploads/2.jpg"],
        from: "João",
        to: "Maria",
        message: "Uma mensagem especial para você...",
        signature: "Com amor, João",
        closing: "Obrigado por tudo!",
        youtubeLink: "https://example.com/audio.mp3"
    };

    return <CinematicPreview data={messageData} autoPlay={true} />;
}
```

### Controlled Usage

```tsx
import { CinematicPreview, PreviewStage } from '@/components/editor/CinematicPreview';
import { useState } from 'react';

function EditorPage() {
    const [stage, setStage] = useState<PreviewStage>("intro-1");

    return (
        <CinematicPreview 
            data={messageData}
            stage={stage}
            onStageChange={setStage}
        />
    );
}
```

## Stage Timing

- **intro-1**: 4 seconds
- **intro-2**: 4 seconds
- **intro-action**: User interaction required
- **transition**: 2 seconds
- **reveal-photo**: 3 seconds
- **reveal-intro**: 4 seconds
- **reveal-message**: 8 seconds (typewriter duration)
- **reading**: User interaction required
- **closing-1**: 4 seconds
- **closing-2**: 4 seconds
- **final**: User interaction required
- **full-view**: No auto-transition

## Default Values

When data fields are empty, the component uses sensible defaults:

- **title**: "Uma mensagem especial"
- **message**: "Sua mensagem especial aparecerá aqui..."
- **signature**: "Com carinho, {from}"
- **closing**: "Obrigado por sentir isso."
- **from/to**: "..."
- **specialDate**: Current date

## Animations

### Typewriter Effect
- Speed: 50ms per character (configurable)
- Delay: Configurable start delay
- Resets on text change

### Photo Reveal
- Initial: Blurred and scaled down
- Transition: 2 second smooth reveal
- Glow effect on reveal

### Floating Particles
- 20 animated particles
- Random positioning and movement
- Active in all stages except full-view

## Music Integration

The component supports audio playback with:
- Automatic fade-in on start
- Volume control toggle
- Visual playing indicator
- Music visualizer in full-view

## Responsive Behavior

- **Mobile (<768px)**: Single column layout, adjusted text sizes
- **Desktop (≥768px)**: Multi-column gallery, larger text

## Requirements Validation

This component validates the following requirements:

- **2.2**: Title displays in preview with prominent typography
- **2.4**: Title appears in cinematic intro sequence
- **3.2**: Date formatted as "DD de MMMM, YYYY" in Portuguese
- **3.3**: Formatted date displays in preview header
- **4.6**: Gallery photos display in full-view grid layout
- **5.2**: Closing message displays in closing sequence
- **6.2**: Signature displays below main message
- **10.1**: Preview simulates full cinematic experience
- **10.3**: All stages of cinematic sequence display
- **10.4**: Restart preview functionality available
- **10.6**: All customizations accurately reflected

## Styling

The component uses:
- Tailwind CSS for styling
- Framer Motion for animations
- Custom color palette (primary, secondary, muted)
- Font families: serif, script, handwriting, sans

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- ARIA labels for interactive elements
- Sufficient color contrast ratios
