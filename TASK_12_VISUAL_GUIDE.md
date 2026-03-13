# Task 12: Visual Guide to Progress Indicators

## Overview

This guide shows the visual hierarchy and placement of all progress indicators implemented in Task 12.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Editar 12 Cartas                    [5 de 12] [42%] │   │ ← Req 9.1
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    MOMENT NAVIGATION                         │
│  [Momento 1] [Momento 2] [Momento 3]                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      CARD GRID VIEW                          │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ Carta 1          ✓   │  │ Carta 2              │        │ ← Completion
│  │ ┌──────────────────┐ │  │ ┌──────────────────┐ │        │   Checkmark
│  │ │[Mensagem][Foto]  │ │  │ │                  │ │        │   (Req 9.1, 9.2)
│  │ └──────────────────┘ │  │ └──────────────────┘ │        │
│  │ Preview text...      │  │ Preview text...      │        │
│  │ [Editar Mensagem]    │  │ [Editar Mensagem]    │        │
│  │ [Editar Foto]        │  │ [Adicionar Foto]     │        │
│  │ [Adicionar Música]   │  │ [Adicionar Música]   │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ Carta 3          ✓   │  │ Carta 4          ✓   │        │
│  │ ┌──────────────────┐ │  │ ┌──────────────────┐ │        │
│  │ │[Mensagem][Música]│ │  │ │[Msg][Foto][Mús.] │ │        │ ← Status Badges
│  │ └──────────────────┘ │  │ └──────────────────┘ │        │   (Req 9.2,9.3,9.4)
│  │ Preview text...      │  │ Preview text...      │        │
│  │ [Editar Mensagem]    │  │ [Editar Mensagem]    │        │
│  │ [Adicionar Foto]     │  │ [Editar Foto]        │        │
│  │ [Editar Música]      │  │ [Editar Música]      │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         FOOTER                               │
│  [← Anterior]  [Momento 1 de 3]  [Próximo →]               │ ← Req 9.5
│                [2 de 4 cartas completas]                     │
└─────────────────────────────────────────────────────────────┘
```

## Badge Color System

### Message Badge (Requirement 9.2)
```
┌─────────────────┐
│ ✏️ Mensagem     │  ← Green: bg-green-100, text-green-700
└─────────────────┘
```
- Shows when card has non-empty message
- Icon: Edit3 (pencil)
- Indicates message is personalized

### Photo Badge (Requirement 9.3)
```
┌─────────────────┐
│ 🖼️ Foto         │  ← Blue: bg-blue-100, text-blue-700
└─────────────────┘
```
- Shows when card has imageUrl
- Icon: ImageIcon
- Indicates photo is added

### Music Badge (Requirement 9.4)
```
┌─────────────────┐
│ 🎵 Música       │  ← Purple: bg-purple-100, text-purple-700
└─────────────────┘
```
- Shows when card has youtubeUrl
- Icon: Music
- Indicates music is added

## Completion Checkmark (Requirements 9.1, 9.2)

### Visual Design
```
     ┌─────┐
     │  ✓  │  ← Green circle with white checkmark
     └─────┘     Size: 8x8 (32px)
       ~~~       Pulse animation
```

### States
- **Complete**: Green checkmark visible with pulse
- **Incomplete**: No checkmark shown

### Criteria for Completion
A card is considered complete when:
1. Title is not empty
2. Message is not empty
3. Message length ≤ 500 characters

## Progress Bar (Requirement 9.1)

### Header Progress Bar
```
Overall Progress: 42%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

### Visual Elements
- **Label**: "X de Y cartas completas"
- **Badge**: Percentage (0-100%)
- **Bar**: Visual representation
- **Color**: Blue (in progress), Green (100%)

## Moment Indicator (Requirement 9.5)

### Footer Display
```
┌─────────────────────────────┐
│    Momento 1 de 3           │  ← Current moment
│  2 de 4 cartas completas    │  ← Moment progress
└─────────────────────────────┘
```

### Information Shown
- Current moment number (1, 2, or 3)
- Total moments (always 3)
- Completed cards in current moment
- Total cards in current moment (always 4)

## Badge Combinations

### Example 1: Empty Card
```
┌──────────────────────┐
│ Carta Vazia          │
│                      │  ← No badges
│ Nenhuma mensagem...  │
│ [Editar Mensagem]    │
│ [Adicionar Foto]     │
│ [Adicionar Música]   │
└──────────────────────┘
```

### Example 2: Message Only
```
┌──────────────────────┐
│ Carta com Mensagem ✓ │  ← Checkmark
│ [Mensagem]           │  ← Green badge
│ Esta carta tem...    │
│ [Editar Mensagem]    │
│ [Adicionar Foto]     │
│ [Adicionar Música]   │
└──────────────────────┘
```

### Example 3: Message + Photo
```
┌──────────────────────┐
│ Carta com Foto    ✓  │  ← Checkmark
│ [Mensagem] [Foto]    │  ← Green + Blue
│ Esta carta tem...    │
│ [Editar Mensagem]    │
│ [Editar Foto]        │  ← Label changed
│ [Adicionar Música]   │
└──────────────────────┘
```

### Example 4: Complete Card
```
┌──────────────────────┐
│ Carta Completa    ✓  │  ← Checkmark
│ [Msg][Foto][Música]  │  ← All 3 badges
│ Esta carta está...   │
│ [Editar Mensagem]    │
│ [Editar Foto]        │  ← All "Editar"
│ [Editar Música]      │
└──────────────────────┘
```

## Responsive Behavior

### Mobile (< 640px)
- Badges wrap to multiple lines if needed
- Checkmark remains visible at top-right
- Progress bar full width
- Footer stacks vertically

### Tablet (640px - 1024px)
- 2 cards per row
- Badges typically fit in one line
- Progress bar with padding
- Footer horizontal layout

### Desktop (> 1024px)
- 2 cards per row (optimal readability)
- All badges in one line
- Full progress bar width
- Footer horizontal with spacing

## Accessibility

### ARIA Labels
```html
<!-- Completion Checkmark -->
<div role="status" aria-label="Carta completa">
  <div>✓</div>
</div>

<!-- Progress Bar -->
<div 
  role="progressbar" 
  aria-valuenow="42" 
  aria-valuemin="0" 
  aria-valuemax="100"
  aria-label="42% completo"
>
```

### Screen Reader Announcements
- "Carta completa" when checkmark is present
- "42% completo" for progress bar
- "Momento 1 de 3" for moment indicator
- Badge content read as "Mensagem", "Foto", "Música"

## Animation Details

### Pulse Animation (Checkmark)
```css
/* Pulse effect on completion checkmark */
.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
```

### Transition Effects
- Border color: 200ms
- Shadow: 200ms
- Progress bar width: 300ms ease-out
- Badge appearance: fade-in

## Testing Scenarios

### Scenario 1: New User
- All cards empty
- 0% progress
- No badges visible
- No checkmarks

### Scenario 2: Partial Progress
- Some cards with messages
- 25-75% progress
- Mix of badges
- Some checkmarks

### Scenario 3: Complete
- All cards filled
- 100% progress (green badge)
- All cards have checkmarks
- All badges visible where applicable

### Scenario 4: Navigation
- Progress persists between moments
- Moment indicator updates
- Badges remain visible
- Checkmarks stay in place

## Implementation Notes

1. **Badge Priority**: Message badge always shows first (left to right)
2. **Checkmark Z-Index**: Set to 10 to stay above card content
3. **Color Consistency**: Matches overall app color scheme
4. **Performance**: Badges use CSS classes, no JavaScript calculations
5. **Maintainability**: All colors defined in Tailwind config

## Related Files

- `src/components/card-editor/CardPreviewCard.tsx` - Badge implementation
- `src/components/card-editor/GroupedCardCollectionEditor.tsx` - Overall progress
- `src/app/(marketing)/test/progress-indicators/page.tsx` - Test page
- `TASK_12_IMPLEMENTATION_SUMMARY.md` - Detailed documentation
