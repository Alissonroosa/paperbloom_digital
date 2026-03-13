# 🚀 Quick Test Guide - Checkpoint 14

## ⚡ 5-Minute Quick Test

Want to quickly verify the grouped editor works? Follow these steps:

### Prerequisites
```bash
npm run dev
```
Open browser to: `http://localhost:3000/editor/12-cartas`

---

## ✅ Quick Verification Checklist

### 1. Visual Check (30 seconds)
- [ ] Page loads without errors
- [ ] See 3 moment buttons at top
- [ ] See 4 cards displayed
- [ ] Each card has 3 action buttons

### 2. Navigation Test (1 minute)
- [ ] Click "Celebração e Romance" button
- [ ] Verify 4 different cards appear
- [ ] Click "Resolver Conflitos" button
- [ ] Verify 4 different cards appear
- [ ] Click back to "Momentos Emocionais"
- [ ] Verify original 4 cards appear

### 3. Edit Test (2 minutes)
- [ ] Click "Editar Mensagem" on first card
- [ ] Modal opens
- [ ] Type "TESTE" in the message
- [ ] Click "Salvar"
- [ ] Modal closes
- [ ] Card preview updates with "TESTE"

### 4. Persistence Test (1 minute)
- [ ] Press F5 to reload page
- [ ] Page loads to same collection
- [ ] Navigate to first moment
- [ ] Verify "TESTE" is still there

### 5. Responsive Test (30 seconds)
- [ ] Press F12 (DevTools)
- [ ] Press Ctrl+Shift+M (Device toolbar)
- [ ] Select "iPhone SE"
- [ ] Verify cards stack vertically
- [ ] Verify buttons are tappable

---

## 🎯 Expected Results

If all checks pass:
- ✅ Navigation works
- ✅ Editing works
- ✅ Persistence works
- ✅ Responsive design works

**Result:** Editor is working correctly! 🎉

---

## 🐛 Common Issues

### Issue: Cards don't load
**Solution:** Check if database is initialized
```bash
npm run db:migrate
```

### Issue: Can't edit cards
**Solution:** Check browser console for errors (F12)

### Issue: Changes don't persist
**Solution:** Check localStorage is enabled in browser

---

## 📊 Full Test Options

### Option 1: Automated Tests (Fastest)
```bash
npm test checkpoint-14-e2e --run
```
**Time:** ~10 seconds  
**Coverage:** Core functionality

### Option 2: Manual Guide (Comprehensive)
Open: `test-checkpoint-14-manual.md`  
**Time:** ~30 minutes  
**Coverage:** Everything

### Option 3: E2E Tests (Most Thorough)
```bash
npx playwright test test-checkpoint-14-e2e.ts
```
**Time:** ~2 minutes  
**Coverage:** Full browser automation

---

## ✅ Quick Pass/Fail

**PASS if:**
- All 5 quick checks complete
- No console errors
- Navigation is smooth
- Edits are saved

**FAIL if:**
- Page doesn't load
- Navigation doesn't work
- Can't edit cards
- Changes don't persist

---

## 🎉 Success!

If you completed the quick test successfully:

✅ **Checkpoint 14 is verified!**

The grouped card editor is working as expected. You can now:
- Continue to Task 15 (Performance Optimizations)
- Deploy to staging
- Show to users for feedback

---

## 📞 Need Help?

If something doesn't work:

1. Check `CHECKPOINT_14_TEST_RESULTS.md` for detailed info
2. Review `test-checkpoint-14-manual.md` for step-by-step guide
3. Run automated tests to identify specific issues
4. Check browser console for error messages

---

**Quick Test Time:** ~5 minutes  
**Confidence Level:** High  
**Next Step:** Task 15 or Production Deployment
