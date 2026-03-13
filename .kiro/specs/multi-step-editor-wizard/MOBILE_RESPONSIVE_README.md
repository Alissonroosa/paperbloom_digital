# Mobile Responsive Design Implementation

## Overview

This document describes the mobile responsive design implementation for the multi-step wizard editor. The wizard is fully functional on mobile devices with optimized layouts, touch-friendly interactions, and appropriate sizing for small screens.

## Requirements Addressed

- **14.1**: Mobile-optimized layout on screens < 768px
- **14.2**: Vertical stacking of form and preview
- **14.3**: All wizard functionality works on mobile
- **14.4**: Minimum 44x44px touch targets
- **14.5**: Floating preview button for mobile

## Responsive Breakpoints

The implementation uses Tailwind CSS's default breakpoints:

- **Mobile**: < 768px (default, no prefix)
- **Tablet**: ≥ 768px (`md:` prefix)
- **Desktop**: ≥ 1024px (`lg:` prefix)
- **Large Desktop**: ≥ 1280px (`xl:` prefix)

## Key Responsive Features

### 1. Layout Adaptation

#### Desktop (≥ 1024px)
- Two-column grid layout
- Form on the left (50% width)
- Preview panel on the right (50% width)
- Preview is sticky and follows scroll

#### Mobile (< 1024px)
- Single-column layout
- Form takes full width
- Preview hidden by default
- Floating preview button in bottom-right corner
- Preview opens as full-screen modal

```tsx
// Layout structure
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Form - Full width on mobile */}
  <div className="w-full">
    {/* Wizard steps */}
  </div>
  
  {/* Preview - Hidden on mobile, shown via floating button */}
  <PreviewPanel className="hidden lg:block" />
</div>
```

### 2. Touch-Friendly Targets

All interactive elements meet the minimum 44x44px touch target size:

#### Buttons
```tsx
<Button className="min-h-[44px] min-w-[44px]">
  Click Me
</Button>
```

#### Input Fields
```tsx
<Input className="min-h-[44px] text-base" />
```

#### Textarea
```tsx
<Textarea className="min-h-[120px] text-base" />
```

### 3. Typography Scaling

Text sizes are optimized for mobile readability:

```tsx
// Headings
<h1 className="text-2xl md:text-3xl">Title</h1>
<h2 className="text-lg md:text-xl">Subtitle</h2>

// Labels
<Label className="text-sm md:text-base">Field Label</Label>

// Body text uses base size (16px) on mobile for readability
<Input className="text-base" />
```

### 4. Spacing Optimization

Padding and margins are reduced on mobile to maximize screen space:

```tsx
// Container padding
<div className="px-4 md:px-6 lg:px-8">

// Card padding
<Card className="p-4 md:p-6 lg:p-8">

// Vertical spacing
<div className="py-4 md:py-8">
```

### 5. Wizard Stepper Adaptation

The stepper component has two different layouts:

#### Desktop
- Horizontal layout with all steps visible
- Step circles connected by lines
- Step labels below circles

#### Mobile
- Vertical compact layout
- Steps shown as cards
- Current step highlighted
- Progress bar at bottom

### 6. Navigation Buttons

Navigation buttons adapt to screen size:

```tsx
<div className="flex gap-3">
  <Button className="flex-1 md:flex-none">
    <span className="hidden sm:inline">Previous</span>
    <span className="sm:hidden">Prev</span>
  </Button>
  <Button className="flex-1 md:flex-none">
    <span className="hidden sm:inline">Next</span>
    <span className="sm:hidden">Next</span>
  </Button>
</div>
```

### 7. Preview Panel Mobile Behavior

The PreviewPanel component includes built-in mobile support:

- **Desktop**: Sticky sidebar with toggle between Card/Cinema views
- **Mobile**: 
  - Hidden by default
  - Floating button (Eye icon) in bottom-right
  - Opens as full-screen modal
  - Modal includes view toggle and close button

## Component-Specific Responsive Features

### WizardStepper
- Horizontal on desktop (`hidden md:block`)
- Vertical compact on mobile (`md:hidden`)
- Touch-friendly step buttons (44x44px minimum)

### PreviewPanel
- Sticky positioning on desktop
- Floating button on mobile (z-index: 50)
- Full-screen modal on mobile
- Smooth transitions

### Step Components
All step components (Step1-Step7) include:
- Responsive input sizing
- Touch-friendly controls
- Optimized spacing
- Mobile-friendly validation messages

## Testing Mobile Responsiveness

### Browser Testing
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select a mobile device preset (iPhone, Pixel, etc.)
4. Test all wizard steps and interactions

### Real Device Testing
1. Access the test page on a physical device
2. Test portrait and landscape orientations
3. Verify touch interactions
4. Check text readability
5. Test preview modal functionality

### Test Page
Visit `/editor/test-mobile-responsive` to see the complete mobile-responsive implementation with testing instructions.

## Accessibility Considerations

### Touch Targets
- All interactive elements ≥ 44x44px
- Adequate spacing between touch targets (8px minimum)

### Text Readability
- Base font size of 16px on mobile (prevents zoom on iOS)
- Sufficient contrast ratios
- Line height optimized for readability

### Focus Management
- Visible focus indicators
- Logical tab order
- Focus trapped in modals

### Screen Reader Support
- Proper ARIA labels
- Semantic HTML structure
- Status announcements for step changes

## Performance Optimizations

### Mobile-Specific
- Reduced animations on mobile
- Optimized image loading
- Debounced preview updates (300ms)
- Lazy loading for preview modal

### CSS Optimizations
- Tailwind's JIT compiler removes unused styles
- Mobile-first approach (smaller base bundle)
- Conditional rendering for desktop-only features

## Common Patterns

### Responsive Container
```tsx
<div className="container mx-auto px-4 md:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Items */}
</div>
```

### Responsive Text
```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Heading
</h1>
```

### Responsive Spacing
```tsx
<div className="space-y-4 md:space-y-6 lg:space-y-8">
  {/* Items */}
</div>
```

### Touch-Friendly Button
```tsx
<Button className="min-h-[44px] min-w-[44px] w-full md:w-auto">
  Action
</Button>
```

## Browser Support

The responsive design is tested and supported on:

- **Mobile Browsers**:
  - Safari iOS 14+
  - Chrome Android 90+
  - Firefox Android 90+
  - Samsung Internet 14+

- **Desktop Browsers**:
  - Chrome 90+
  - Firefox 90+
  - Safari 14+
  - Edge 90+

## Known Issues and Limitations

### iOS Safari
- Input zoom on focus (mitigated with `font-size: 16px`)
- Viewport height issues with address bar (using `min-h-screen`)

### Android Chrome
- Pull-to-refresh may interfere with scroll (disabled in modal)

### Small Screens (< 375px)
- Some text may wrap more than expected
- Consider horizontal scrolling for very small screens

## Future Enhancements

1. **Gesture Support**: Swipe between steps on mobile
2. **Offline Support**: PWA capabilities for mobile
3. **Native App Feel**: Add splash screen and app icons
4. **Haptic Feedback**: Vibration on button taps (mobile)
5. **Adaptive Images**: Serve smaller images on mobile

## Maintenance Guidelines

### Adding New Components
1. Start with mobile-first design
2. Add responsive classes for larger screens
3. Ensure touch targets ≥ 44x44px
4. Test on real devices
5. Verify accessibility

### Updating Existing Components
1. Check mobile layout after changes
2. Verify touch target sizes
3. Test on multiple screen sizes
4. Update tests if needed

### Testing Checklist
- [ ] Layout works on mobile (< 768px)
- [ ] Touch targets ≥ 44x44px
- [ ] Text is readable (16px minimum)
- [ ] Navigation works with touch
- [ ] Preview modal functions correctly
- [ ] No horizontal scrolling
- [ ] Proper spacing on small screens
- [ ] Accessibility features work

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Touch Target Sizes (WCAG)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Mobile Web Best Practices](https://developers.google.com/web/fundamentals/design-and-ux/principles)
- [iOS Safari Quirks](https://webkit.org/blog/)

## Support

For issues or questions about mobile responsive design:
1. Check this README
2. Review the test page at `/editor/test-mobile-responsive`
3. Inspect the component implementations
4. Test on real devices before reporting issues
