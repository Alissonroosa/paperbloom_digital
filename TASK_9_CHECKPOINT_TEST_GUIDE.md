# Task 9: Checkpoint - Test Guide for Grouped Editor Components

## Overview

This document provides a comprehensive testing guide for all components of the Grouped Card Collection Editor. The test page is located at `/test/grouped-editor` and provides isolated testing for each component.

## Test Page URL

```
http://localhost:3000/test/grouped-editor
```

## Test Modes Available

The test page includes 5 different test modes accessible via the control panel:

### 1. Editor Completo (Full Editor)
Tests the complete `GroupedCardCollectionEditor` component with all features integrated.

**What to Test:**
- ✓ Navigate between the 3 thematic moments
- ✓ Edit messages, add photos and music
- ✓ Test responsiveness by resizing the window
- ✓ Use Tab to navigate via keyboard
- ✓ Press Escape to close modals
- ✓ Verify auto-save indicators appear
- ✓ Check that progress indicators update correctly
- ✓ Test "Anterior", "Próximo", and "Finalizar" buttons

**Expected Behavior:**
- All 12 cards should be accessible across 3 moments
- Edits should persist when navigating between moments
- Modals should open and close smoothly
- Progress should be tracked accurately

### 2. Navegação (MomentNavigation Component)
Tests the `MomentNavigation` component in isolation.

**What to Test:**
- ✓ Click on the 3 navigation buttons
- ✓ Verify the active moment indicator
- ✓ Observe the progress of each moment (X/4 cards)
- ✓ Test keyboard navigation (Tab + Enter)

**Expected Behavior:**
- Active moment should be visually highlighted
- Progress indicators should show correct completion status
- Clicking a moment button should change the current moment
- All buttons should be keyboard accessible

### 3. Grid (CardGridView Component)
Tests the `CardGridView` component showing 4 cards at once.

**What to Test:**
- ✓ Visualize the 4 cards of the current moment
- ✓ Click on action buttons of each card
- ✓ Test responsiveness (1 col mobile, 2 cols desktop)
- ✓ Navigate between moments to see different cards

**Expected Behavior:**
- Grid should display exactly 4 cards
- Layout should adapt to screen size:
  - Mobile (< 768px): 1 column
  - Tablet/Desktop (≥ 768px): 2 columns
- All action buttons should trigger appropriate alerts
- Cards should update when changing moments

### 4. Preview (CardPreviewCard Component)
Tests individual `CardPreviewCard` components with different states.

**What to Test:**
- ✓ Observe title, message, and media indicators
- ✓ Verify dynamic button labels
- ✓ Test all 3 action buttons
- ✓ Resize to test responsiveness

**Expected Behavior:**
- Cards with photos should show photo indicator badge
- Cards with music should show music indicator badge
- Button labels should change:
  - "Adicionar Foto" → "Editar Foto" (when photo exists)
  - "Adicionar Música" → "Editar Música" (when music exists)
- Message preview should truncate long text
- Empty cards should show placeholder text

### 5. Modais (Modal Components)
Tests all three modal components: EditMessageModal, PhotoUploadModal, and MusicSelectionModal.

**What to Test:**
- ✓ Open each type of modal (Message, Photo, Music)
- ✓ Test save and cancel functionality
- ✓ Press Escape to close
- ✓ Click outside modal to test confirmation
- ✓ Test on mobile (modals should be fullscreen)

**Expected Behavior:**
- **EditMessageModal:**
  - Should show current title and message
  - Character counter should update in real-time
  - Save button should update the card
  - Cancel should discard changes
  - Escape should close modal

- **PhotoUploadModal:**
  - Should show current photo if exists
  - Drag-and-drop area should be visible
  - File validation should work (format and size)
  - Remove button should appear if photo exists
  - Upload progress should be shown

- **MusicSelectionModal:**
  - Should show current YouTube URL if exists
  - URL validation should work in real-time
  - Video preview should appear for valid URLs
  - Remove button should appear if music exists
  - Invalid URLs should show error message

## Keyboard Accessibility Testing

### Navigation Keys
- **Tab**: Move focus to next interactive element
- **Shift + Tab**: Move focus to previous interactive element
- **Enter** or **Space**: Activate focused button
- **Escape**: Close open modal

### Test Checklist
- [ ] All buttons are reachable via Tab
- [ ] Focus indicators are visible
- [ ] Modals can be closed with Escape
- [ ] Enter/Space activates buttons
- [ ] Focus is trapped within open modals
- [ ] Focus returns to trigger element after modal closes

## Responsiveness Testing

### Breakpoints to Test

#### Mobile (< 768px)
- [ ] Card grid shows 1 column
- [ ] Modals are fullscreen
- [ ] Navigation buttons stack vertically
- [ ] Touch targets are at least 44x44px
- [ ] Text is readable without zooming

#### Tablet (768px - 1024px)
- [ ] Card grid shows 2 columns
- [ ] Modals are centered with padding
- [ ] Navigation is horizontal
- [ ] All content fits without horizontal scroll

#### Desktop (> 1024px)
- [ ] Card grid shows 2 columns
- [ ] Modals are centered with max-width
- [ ] All features are easily accessible
- [ ] Hover states work correctly

### How to Test
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test at different viewport sizes:
   - 375px (iPhone SE)
   - 768px (iPad)
   - 1024px (iPad Pro)
   - 1920px (Desktop)

## Component Integration Testing

### Full Flow Test
1. Start at Moment 1 (Momentos Emocionais e de Apoio)
2. Edit message of Card 1
3. Add photo to Card 2
4. Add music to Card 3
5. Navigate to Moment 2
6. Edit messages for all 4 cards
7. Navigate to Moment 3
8. Complete remaining cards
9. Verify progress indicators show 12/12
10. Click "Finalizar" button

### Expected Results
- All edits should persist across navigation
- Progress indicators should update correctly
- No data should be lost
- Finalize button should only be enabled when all cards are complete

## Modal Behavior Testing

### EditMessageModal
- [ ] Opens when clicking "Editar Mensagem"
- [ ] Shows current title and message
- [ ] Character counter works (500 char limit)
- [ ] Save updates the card
- [ ] Cancel discards changes
- [ ] Escape closes modal
- [ ] Click outside shows confirmation if changes exist

### PhotoUploadModal
- [ ] Opens when clicking "Adicionar/Editar Foto"
- [ ] Shows current photo if exists
- [ ] Drag-and-drop works
- [ ] File input works
- [ ] Validates file format (JPEG, PNG, WebP)
- [ ] Validates file size (max 5MB)
- [ ] Shows upload progress
- [ ] Remove button works
- [ ] Save updates the card
- [ ] Cancel discards changes

### MusicSelectionModal
- [ ] Opens when clicking "Adicionar/Editar Música"
- [ ] Shows current YouTube URL if exists
- [ ] URL validation works in real-time
- [ ] Video preview appears for valid URLs
- [ ] Invalid URLs show error
- [ ] Remove button works
- [ ] Save updates the card
- [ ] Cancel discards changes

## Visual Indicators Testing

### Progress Indicators
- [ ] Overall progress shows X/12 cards completed
- [ ] Each moment shows X/4 cards completed
- [ ] Percentage is calculated correctly
- [ ] Indicators update immediately after edits

### Media Indicators
- [ ] Photo badge appears when photo is added
- [ ] Music badge appears when music is added
- [ ] Badges disappear when media is removed
- [ ] Badge colors are distinct and visible

### Button Labels
- [ ] "Adicionar Foto" changes to "Editar Foto"
- [ ] "Adicionar Música" changes to "Editar Música"
- [ ] "Editar Mensagem" stays consistent
- [ ] Labels update immediately after changes

## Error Handling Testing

### Validation Errors
- [ ] Empty title shows error
- [ ] Message over 500 chars shows error
- [ ] Invalid image format shows error
- [ ] Image over 5MB shows error
- [ ] Invalid YouTube URL shows error

### User Experience
- [ ] Errors are clearly visible
- [ ] Error messages are helpful
- [ ] User can correct errors easily
- [ ] No data is lost on validation errors

## Performance Testing

### Load Time
- [ ] Page loads in under 2 seconds
- [ ] Components render without flicker
- [ ] Images load progressively

### Interactions
- [ ] Button clicks respond immediately
- [ ] Modal animations are smooth (60fps)
- [ ] No lag when typing in text fields
- [ ] Navigation between moments is instant

### Memory
- [ ] No memory leaks when opening/closing modals
- [ ] Browser doesn't slow down after extended use
- [ ] Images are properly garbage collected

## Browser Compatibility

Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Accessibility Compliance

### WCAG 2.1 Level AA
- [ ] All interactive elements have accessible names
- [ ] Color contrast meets 4.5:1 minimum
- [ ] Focus indicators are visible
- [ ] Keyboard navigation works completely
- [ ] Screen reader announces changes
- [ ] No keyboard traps exist

### Screen Reader Testing
Test with:
- [ ] NVDA (Windows)
- [ ] JAWS (Windows)
- [ ] VoiceOver (macOS/iOS)
- [ ] TalkBack (Android)

## Known Issues and Limitations

### Current Limitations
1. Test page uses mock data (not saved to server)
2. Image uploads in test mode show alerts instead of actual uploads
3. Auto-save is simulated (localStorage only)

### Expected Behavior
- All interactions should work as in production
- Data persists only during the session
- Alerts confirm actions instead of actual API calls

## Troubleshooting

### Page Won't Load
1. Check that dev server is running: `npm run dev`
2. Clear browser cache
3. Check console for errors (F12)

### Components Not Rendering
1. Verify all imports are correct
2. Check that Context provider is wrapping components
3. Look for TypeScript errors in console

### Modals Not Opening
1. Check that state is being updated
2. Verify modal components are imported
3. Check for z-index conflicts

### Keyboard Navigation Not Working
1. Ensure elements have proper tabIndex
2. Check that focus is not trapped
3. Verify aria-labels are present

## Success Criteria

Task 9 is complete when:
- ✅ All 5 test modes work correctly
- ✅ All components render without errors
- ✅ Responsiveness works at all breakpoints
- ✅ Keyboard accessibility is fully functional
- ✅ All modals open and close correctly
- ✅ No console errors or warnings
- ✅ Visual indicators update correctly
- ✅ User can complete full editing flow

## Next Steps

After completing this checkpoint:
1. Document any issues found
2. Fix critical bugs before proceeding
3. Get user approval to continue
4. Move to Task 10: Integration with main editor page

## Questions to Ask User

Before marking this task complete, ask:
1. Have you tested all 5 test modes?
2. Did you find any issues with responsiveness?
3. Does keyboard navigation work as expected?
4. Are all modals opening and closing correctly?
5. Is there anything that needs adjustment before integration?

---

**Test Page Location:** `src/app/(marketing)/test/grouped-editor/page.tsx`
**Task Status:** Ready for testing
**Last Updated:** 2026-01-05
