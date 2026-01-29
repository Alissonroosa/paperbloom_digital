# Implementation Plan

- [x] 1. Extend database schema and types for enhanced message fields





  - Create database migration to add new columns (title, special_date, closing_message, signature, gallery_images)
  - Update Message type interfaces to include new fields
  - Extend Zod validation schemas for enhanced message creation
  - Update rowToMessage conversion function
  - _Requirements: 2.1, 3.1, 5.1, 6.1, 4.1_

- [ ]* 1.1 Write property test for character limit validation
  - **Property 2: Title character limit enforcement**
  - **Property 11: Closing message character limit**
  - **Property 13: Signature character limit**
  - **Validates: Requirements 2.3, 5.3, 6.3**

- [ ]* 1.2 Write property test for date validation
  - **Property 5: Date validation**
  - **Validates: Requirements 3.5**

- [x] 2. Create template and suggestion data structures





  - Create templates.ts with at least 5 template categories (Aniversário, Amor, Amizade, Gratidão, Parabéns)
  - Create models.ts with at least 3 complete examples per template category
  - Create suggestions.ts with text suggestions for title (5+), message (10+), and closing (5+) fields
  - Organize suggestions by category (Romântico, Amigável, Formal, Casual)
  - _Requirements: 7.1, 8.1, 9.1, 9.2, 9.3, 9.5_

- [ ]* 2.1 Write property test for suggestion categorization
  - **Property 19: Suggestion categorization**
  - **Validates: Requirements 9.5**

- [x] 3. Update MessageService to handle enhanced fields





  - Extend createMessage method to accept enhanced message data
  - Update database queries to include new columns
  - Add validation for gallery images array (max 3 items)
  - Update message retrieval to include all new fields
  - _Requirements: 1.4, 4.1, 11.7_

- [ ]* 3.1 Write property test for photo upload limit
  - **Property 6: Photo upload limit enforcement**
  - **Validates: Requirements 4.1**

- [x] 4. Enhance ImageService for gallery uploads





  - Add support for multiple image uploads in a single request
  - Implement image type validation (JPEG, PNG, WebP)
  - Implement file size validation (max 5MB per image)
  - Return array of uploaded image URLs
  - _Requirements: 4.3, 4.4, 11.6_

- [ ]* 4.1 Write property test for image validation
  - **Property 7: Image format validation**
  - **Property 8: Image size validation**
  - **Property 27: File validation**
  - **Validates: Requirements 4.3, 4.4, 11.6**

- [x] 5. Create TemplateSelector component





  - Display template cards with thumbnails and descriptions
  - Implement template selection handler
  - Show model gallery for each template category
  - Handle template/model application to editor state
  - _Requirements: 7.1, 7.2, 8.1, 8.3_

- [ ]* 5.1 Write property test for template application
  - **Property 14: Template application populates fields**
  - **Property 15: Template fields remain editable**
  - **Validates: Requirements 7.2, 7.3**

- [ ]* 5.2 Write property test for model application
  - **Property 16: Model application populates fields**
  - **Property 17: Model fields remain editable**
  - **Validates: Requirements 8.3, 8.4**

- [x] 6. Create TextSuggestionPanel component





  - Display suggestions filtered by field and category
  - Implement suggestion selection handler
  - Insert selected suggestion into corresponding field
  - Ensure inserted text remains editable
  - _Requirements: 9.4, 9.5, 9.6_

- [ ]* 6.1 Write property test for suggestion insertion
  - **Property 18: Suggestion insertion**
  - **Property 20: Suggestions remain editable**
  - **Validates: Requirements 9.4, 9.6**

- [x] 7. Extend EditorForm component with new fields





  - Add TitleInput with character counter (max 100)
  - Add DatePicker for special date selection
  - Add SignatureInput with character counter (max 50)
  - Add ClosingTextarea with character counter (max 200)
  - Add GalleryUploader for 3 additional photos
  - Integrate TextSuggestionPanel for title, message, and closing fields
  - _Requirements: 2.1, 2.3, 3.1, 5.1, 5.3, 5.5, 6.1, 6.3, 4.1_

- [ ]* 7.1 Write property test for input reflection in preview
  - **Property 1: Title input reflects in preview**
  - **Property 10: Closing message reflects in preview**
  - **Property 12: Signature reflects in preview**
  - **Validates: Requirements 2.2, 5.2, 6.2**

- [x] 8. Create enhanced validation logic





  - Implement validateEditorForm function for all fields
  - Add character limit validation for title, closing, signature
  - Add YouTube URL format validation
  - Add image file format and size validation
  - Add required field validation
  - Display field-specific error messages
  - _Requirements: 11.1, 11.2, 11.5, 11.6, 11.7_

- [ ]* 8.1 Write property test for validation
  - **Property 23: Validation runs before payment**
  - **Property 24: Validation errors display messages**
  - **Property 25: Invalid form blocks payment**
  - **Property 26: YouTube URL validation**
  - **Property 28: Character limit validation across fields**
  - **Validates: Requirements 11.1, 11.2, 11.3, 11.5, 11.7**

- [x] 9. Create CinematicPreview component





  - Implement all preview stages (intro-1, intro-2, intro-action, transition, reveal-photo, reveal-intro, reveal-message, reading, closing-1, closing-2, final, full-view)
  - Add stage transition logic with timing
  - Display title in intro sequence
  - Display formatted date in header
  - Display main photo with reveal animation
  - Display message with typewriter effect
  - Display signature below message
  - Display closing message in closing sequence
  - Display gallery photos in full-view grid layout
  - Add restart preview functionality
  - _Requirements: 2.2, 2.4, 3.2, 3.3, 4.6, 5.2, 6.2, 10.1, 10.3, 10.4, 10.6_

- [ ]* 9.1 Write property test for preview updates
  - **Property 21: Preview updates with data changes**
  - **Property 22: All customizations appear in preview**
  - **Validates: Requirements 10.2, 10.6**

- [ ]* 9.2 Write property test for date formatting
  - **Property 3: Date formatting consistency**
  - **Property 4: Date appears in preview**
  - **Validates: Requirements 3.2, 3.3**

- [ ]* 9.3 Write property test for gallery photos in preview
  - **Property 9: Gallery photos appear in preview**
  - **Validates: Requirements 4.6**

- [x] 10. Implement auto-save functionality





  - Create useAutoSave custom hook
  - Save editor state to localStorage after 2 seconds of inactivity
  - Restore saved state when user returns to editor
  - Display auto-save indicator
  - Clear saved draft after payment completion
  - Add manual "Clear Draft" button
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 10.1 Write property test for auto-save
  - **Property 29: Auto-save persistence**
  - **Property 30: Auto-save round-trip**
  - **Property 31: Payment completion clears draft**
  - **Validates: Requirements 12.1, 12.2, 12.4**

- [x] 11. Migrate editor route from /editor to /editor/mensagem





  - Create new page at src/app/(marketing)/editor/mensagem/page.tsx
  - Move existing editor logic to new location
  - Set up redirect from /editor to /editor/mensagem
  - Update all internal links to use new route
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 12. Update API routes to handle enhanced message data





  - Update /api/messages/create to accept enhanced fields
  - Update /api/messages/upload-image to handle gallery uploads
  - Update response types to include new fields
  - Maintain backward compatibility with existing messages
  - _Requirements: 1.4, 4.1_

- [x] 13. Integrate all components in editor page





  - Compose EditorPage with TemplateSelector, EditorForm, and CinematicPreview
  - Implement state management for editor data
  - Connect form validation to payment button
  - Wire up auto-save functionality
  - Handle image uploads for main and gallery photos
  - Implement real-time preview updates
  - _Requirements: 1.3, 10.2, 11.3_

- [x] 14. Add responsive design and accessibility features





  - Implement mobile-optimized layout for screens < 768px
  - Ensure touch targets are minimum 44x44px
  - Add keyboard navigation support
  - Add ARIA labels for screen readers
  - Verify text contrast ratios (minimum 4.5:1)
  - Test all functionality on mobile devices
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [x] 15. Final checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
