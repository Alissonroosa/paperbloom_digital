# Task 22 Verification Guide

## Quick Start

### 1. Run the Test Script

```bash
npx tsx test-card-collection-page.ts
```

This will:
- Create a test collection with 12 cards
- Generate a slug
- Open one card
- Provide a URL to test

### 2. Start Development Server

```bash
npm run dev
```

### 3. Visit the Test URL

The test script will output a URL like:
```
http://localhost:3000/cartas/test-collection-1767585030549
```

## Manual Testing Checklist

### Page Load
- [ ] Page loads without errors
- [ ] Loading spinner appears briefly
- [ ] No console errors

### Header Section
- [ ] Heart icon displays
- [ ] "12 Cartas Especiais" title shows
- [ ] Sender name displays correctly ("João Santos")
- [ ] Recipient name displays correctly ("Maria Silva")
- [ ] Instructions text is visible
- [ ] Header is sticky on scroll

### Card Grid
- [ ] All 12 cards display
- [ ] Cards are in correct order (1-12)
- [ ] Each card shows:
  - [ ] Lock/Unlock icon
  - [ ] Card number
  - [ ] Card title
  - [ ] Status badge (Aberta/Fechada)
- [ ] One card shows as "Aberta" (from test script)
- [ ] 11 cards show as "Fechada"
- [ ] Opened card has gray/muted appearance
- [ ] Unopened cards have colorful appearance

### Card Opening (Unopened Card)
- [ ] Click on unopened card
- [ ] Confirmation modal appears
- [ ] Modal shows:
  - [ ] Lock icon
  - [ ] "Abrir esta carta?" title
  - [ ] Card number
  - [ ] Card title
  - [ ] Warning message about one-time opening
  - [ ] "Cancelar" button
  - [ ] "Abrir Carta" button
- [ ] Click "Cancelar" closes modal
- [ ] Click "Abrir Carta" opens the card

### Card Modal (First Opening)
- [ ] Modal appears with animation
- [ ] Falling emojis effect plays
- [ ] Content reveals after delay
- [ ] Modal shows:
  - [ ] Close button (X)
  - [ ] Card header with gradient
  - [ ] Card number and title
  - [ ] Photo (if available)
  - [ ] Message text
  - [ ] Music player (if available)
  - [ ] "First open" warning message
  - [ ] "Fechar Carta" button
- [ ] Music plays automatically (if available)
- [ ] Close button works
- [ ] Click outside modal closes it
- [ ] ESC key closes modal

### Card Status After Opening
- [ ] Card now shows as "Aberta"
- [ ] Card has gray/muted appearance
- [ ] Card shows unlock icon
- [ ] Status badge says "Aberta"

### Card Opening (Already Opened)
- [ ] Click on opened card
- [ ] Confirmation modal appears
- [ ] Click "Abrir Carta"
- [ ] Modal shows limited content
- [ ] No falling emojis
- [ ] Shows "already opened" message
- [ ] Shows opening date/time
- [ ] No photo displayed
- [ ] No message text displayed
- [ ] No music player

### Responsive Design

#### Mobile (< 640px)
- [ ] 2 columns of cards
- [ ] Header text readable
- [ ] Modal fits screen
- [ ] Touch interactions work

#### Tablet (640px - 1024px)
- [ ] 3-4 columns of cards
- [ ] Layout looks balanced
- [ ] Modal centered

#### Desktop (> 1024px)
- [ ] 6 columns of cards
- [ ] Full layout visible
- [ ] Modal centered
- [ ] Hover effects work

### Error Handling

#### Invalid Slug
1. Visit: `http://localhost:3000/cartas/invalid-slug-123`
2. Verify:
   - [ ] Error page displays
   - [ ] Friendly error message
   - [ ] Suggestions shown
   - [ ] No console errors

#### Network Error
1. Stop the server
2. Try to open a card
3. Verify:
   - [ ] Alert shows error message
   - [ ] Page doesn't crash
   - [ ] Can retry after server restart

### Accessibility

#### Keyboard Navigation
- [ ] Tab through cards
- [ ] Enter/Space opens card
- [ ] Tab through modal elements
- [ ] ESC closes modal
- [ ] Focus visible on all elements

#### Screen Reader
- [ ] Header has proper structure
- [ ] Cards have descriptive labels
- [ ] Modal has proper ARIA attributes
- [ ] Status changes announced

### Performance
- [ ] Page loads quickly (< 2s)
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] No lag when opening cards
- [ ] Images load progressively

## Test Scenarios

### Scenario 1: First-Time Recipient
1. Visit page with fresh slug
2. See all 12 unopened cards
3. Read sender information
4. Click first card
5. Confirm opening
6. Watch animation
7. View content
8. Close modal
9. See card marked as opened

### Scenario 2: Returning Recipient
1. Visit page with existing slug
2. See mix of opened/unopened cards
3. Try to open already-opened card
4. See limited content
5. Open another unopened card
6. See full content

### Scenario 3: Complete Journey
1. Open all 12 cards one by one
2. Verify each opens correctly
3. Verify all show as opened
4. Try to reopen any card
5. Verify limited content shown

## Expected Results

### All Tests Pass ✅
- Page loads correctly
- Collection information displays
- Cards display in grid
- Opening works correctly
- Modal shows content
- Status updates correctly
- Errors handled gracefully
- Responsive on all devices
- Accessible to all users

## Common Issues

### Issue: Page shows "Collection not found"
**Solution**: Make sure you're using the slug from the test script output

### Issue: Cards don't open
**Solution**: Check browser console for errors, verify API is running

### Issue: Music doesn't play
**Solution**: Check YouTube URL is valid, browser allows autoplay

### Issue: Images don't load
**Solution**: Check image URLs are accessible, network connection

## Success Criteria

✅ All checklist items pass
✅ No console errors
✅ Smooth user experience
✅ Responsive on all devices
✅ Accessible to all users
✅ Error handling works
✅ Performance is good

## Next Steps

After verification:
1. Test with real data
2. Test on different browsers
3. Test on mobile devices
4. Get user feedback
5. Make any necessary adjustments
6. Deploy to production

## Notes

- Test URL is generated by `test-card-collection-page.ts`
- One card is pre-opened by the test script
- Use different slugs for different test scenarios
- Clear browser cache if experiencing issues
