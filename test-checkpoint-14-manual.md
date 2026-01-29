# Checkpoint 14 - Manual E2E Testing Guide

This guide provides step-by-step instructions for manually testing the complete end-to-end flow of the grouped card editor.

## Prerequisites

1. Start the development server: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Clear localStorage (DevTools > Application > Local Storage > Clear All)

## Test Scenarios

### Scenario 1: Complete Flow - Create, Edit, Persist, Checkout

#### Step 1: Navigate to Editor
- [ ] Go to `/editor/12-cartas`
- [ ] Verify page loads without errors
- [ ] Verify 3 moment navigation buttons are visible
- [ ] Verify 4 cards are displayed

**Expected Result:** Editor loads with first moment (Momentos Emocionais) showing 4 cards

#### Step 2: Verify Thematic Moments
- [ ] Check "Momentos Emocionais e de Apoio" button is visible
- [ ] Check "Momentos de Celebração e Romance" button is visible
- [ ] Check "Momentos para Resolver Conflitos e Rir" button is visible
- [ ] Verify first moment is highlighted/active

**Expected Result:** All 3 moment buttons visible, first one active

#### Step 3: Edit Cards in Moment 1 (Cards 1-4)
For each card (0-3):
- [ ] Click "Editar Mensagem" button
- [ ] Verify modal opens with current message
- [ ] Edit the message text (add "TESTE E2E - Card X")
- [ ] Click "Salvar"
- [ ] Verify modal closes
- [ ] Verify card preview updates with new text
- [ ] Wait 2 seconds for auto-save

**Expected Result:** All 4 cards in moment 1 have custom messages

#### Step 4: Add Photo to Card 1
- [ ] Click "Adicionar Foto" button on first card
- [ ] Verify photo upload modal opens
- [ ] Try drag-and-drop or file selection
- [ ] Upload a valid image (JPEG/PNG, < 5MB)
- [ ] Verify preview shows uploaded image
- [ ] Click "Salvar"
- [ ] Verify modal closes
- [ ] Verify card shows photo indicator/badge
- [ ] Verify button changes to "Editar Foto"

**Expected Result:** Card 1 has photo, indicator visible, button label changed

#### Step 5: Add Music to Card 2
- [ ] Click "Adicionar Música" button on second card
- [ ] Verify music selection modal opens
- [ ] Enter YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- [ ] Verify URL validation (green checkmark or similar)
- [ ] Verify video preview appears
- [ ] Click "Salvar"
- [ ] Verify modal closes
- [ ] Verify card shows music indicator/badge
- [ ] Verify button changes to "Editar Música"

**Expected Result:** Card 2 has music, indicator visible, button label changed

#### Step 6: Navigate to Moment 2
- [ ] Click "Momentos de Celebração e Romance" button
- [ ] Verify moment 2 becomes active
- [ ] Verify 4 new cards are displayed (cards 5-8)
- [ ] Verify previous edits are preserved (check by going back to moment 1)

**Expected Result:** Moment 2 shows 4 cards, navigation works, data preserved

#### Step 7: Edit Cards in Moment 2 (Cards 5-8)
For each card (4-7):
- [ ] Click "Editar Mensagem" button
- [ ] Edit the message (add "MOMENTO 2 - Card X")
- [ ] Click "Salvar"
- [ ] Verify changes saved

**Expected Result:** All 4 cards in moment 2 have custom messages

#### Step 8: Navigate to Moment 3
- [ ] Click "Momentos para Resolver Conflitos e Rir" button
- [ ] Verify moment 3 becomes active
- [ ] Verify 4 new cards are displayed (cards 9-12)

**Expected Result:** Moment 3 shows 4 cards

#### Step 9: Edit Cards in Moment 3 (Cards 9-12)
For each card (8-11):
- [ ] Click "Editar Mensagem" button
- [ ] Edit the message (add "MOMENTO 3 - Card X")
- [ ] Click "Salvar"
- [ ] Verify changes saved

**Expected Result:** All 4 cards in moment 3 have custom messages

#### Step 10: Verify Progress Indicators
- [ ] Check header for overall progress (should show 12/12 or 100%)
- [ ] Check each moment button for completion status
- [ ] Verify cards with media show appropriate badges
- [ ] Check moment indicator shows "3 de 3" or similar

**Expected Result:** Progress indicators show all cards completed

#### Step 11: Test Persistence - Reload Page
- [ ] Note current URL (should have collection ID)
- [ ] Press F5 or Ctrl+R to reload page
- [ ] Verify page loads to same collection
- [ ] Verify current moment is preserved (should be moment 3)
- [ ] Navigate to moment 1
- [ ] Verify all edits are still present
- [ ] Navigate to moment 2
- [ ] Verify all edits are still present
- [ ] Check card 1 still has photo
- [ ] Check card 2 still has music

**Expected Result:** All data persisted after reload

#### Step 12: Navigate to Checkout
- [ ] Go to moment 3 (last moment)
- [ ] Look for "Finalizar e Comprar" or "Checkout" button
- [ ] Verify button is enabled (not disabled)
- [ ] Click the button
- [ ] Verify navigation to checkout page

**Expected Result:** Successfully navigate to checkout

---

### Scenario 2: Responsive Design Testing

#### Mobile (375px width)
- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select "iPhone SE" or set width to 375px
- [ ] Navigate to `/editor/12-cartas`
- [ ] Verify cards display in single column
- [ ] Verify modals are fullscreen
- [ ] Verify all buttons are easily tappable (44x44px minimum)
- [ ] Test editing a card
- [ ] Test navigation between moments

**Expected Result:** Layout adapts to mobile, all features work

#### Tablet (768px width)
- [ ] Set viewport to 768px width (iPad)
- [ ] Reload page
- [ ] Verify cards display in 2-column grid
- [ ] Verify navigation is accessible
- [ ] Test editing a card
- [ ] Verify modals are appropriately sized

**Expected Result:** Layout adapts to tablet, 2-column grid

#### Desktop (1920px width)
- [ ] Set viewport to 1920px width
- [ ] Reload page
- [ ] Verify cards display in 2-column grid with good spacing
- [ ] Verify all elements are properly aligned
- [ ] Test all functionality

**Expected Result:** Layout looks good on large screens

---

### Scenario 3: Accessibility Testing

#### Keyboard Navigation
- [ ] Navigate to editor
- [ ] Press Tab repeatedly
- [ ] Verify focus moves through all interactive elements
- [ ] Verify focus indicator is visible
- [ ] Tab to a moment button, press Enter
- [ ] Verify moment changes
- [ ] Tab to "Editar Mensagem" button, press Enter
- [ ] Verify modal opens
- [ ] Press Escape
- [ ] Verify modal closes
- [ ] Tab through modal elements when open
- [ ] Verify focus is trapped in modal

**Expected Result:** Full keyboard navigation works

#### Screen Reader (Optional)
- [ ] Enable screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)
- [ ] Navigate through editor
- [ ] Verify all buttons have descriptive labels
- [ ] Verify moment changes are announced
- [ ] Verify modal opening/closing is announced
- [ ] Verify form fields have labels

**Expected Result:** Screen reader can navigate and understand interface

#### ARIA Attributes
- [ ] Open DevTools > Elements
- [ ] Inspect moment navigation buttons
- [ ] Verify `aria-label` or `aria-labelledby` present
- [ ] Inspect modals
- [ ] Verify `role="dialog"` present
- [ ] Verify `aria-modal="true"` present
- [ ] Inspect form fields
- [ ] Verify proper labels and associations

**Expected Result:** Proper ARIA attributes throughout

---

### Scenario 4: Error Handling

#### Invalid Image Upload
- [ ] Click "Adicionar Foto"
- [ ] Try to upload a .txt file
- [ ] Verify error message appears
- [ ] Try to upload a 10MB image
- [ ] Verify size error message appears

**Expected Result:** Validation errors shown, upload prevented

#### Invalid YouTube URL
- [ ] Click "Adicionar Música"
- [ ] Enter invalid URL: `https://google.com`
- [ ] Verify error message appears
- [ ] Verify Save button is disabled
- [ ] Enter valid URL
- [ ] Verify error clears
- [ ] Verify Save button is enabled

**Expected Result:** URL validation works in real-time

#### Unsaved Changes Warning
- [ ] Open edit message modal
- [ ] Make changes to text
- [ ] Click outside modal (on backdrop)
- [ ] Verify confirmation dialog appears
- [ ] Test "Salvar", "Descartar", "Cancelar" options

**Expected Result:** User is warned about unsaved changes

---

## Test Results Summary

### ✅ Passed Tests
- [ ] Complete flow (create, edit, persist, checkout)
- [ ] All 12 cards can be edited
- [ ] Photos can be added
- [ ] Music can be added
- [ ] Navigation between moments works
- [ ] Data persists after reload
- [ ] Progress indicators work
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop responsive
- [ ] Keyboard navigation
- [ ] ARIA attributes present
- [ ] Error handling works

### ❌ Failed Tests
(List any failures here)

### ⚠️ Issues Found
(List any bugs or issues here)

---

## Performance Checks

- [ ] Page loads in < 3 seconds
- [ ] Modal opens/closes smoothly (< 300ms)
- [ ] Navigation between moments is instant
- [ ] Auto-save doesn't cause UI lag
- [ ] No console errors
- [ ] No console warnings (or only expected ones)

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

---

## Notes

Record any observations, issues, or suggestions here:

```
[Your notes here]
```

---

## Sign-off

- Tester: _______________
- Date: _______________
- Result: ✅ PASS / ❌ FAIL
- Notes: _______________
